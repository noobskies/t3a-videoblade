# Phase 1: S3 Video Upload

## Goal

Implement video file upload to AWS S3 with progress tracking and create video records in database.

**Estimated Time**: 4-6 hours

---

## Prerequisites

- [x] 00-prerequisites.md - AWS S3 configured
- [x] 01-database-schema.md - Video model exists
- [x] AWS SDK packages installed
- [x] Environment variables configured

---

## Architecture

**Upload Flow**:

1. **Client** → Request presigned URL from tRPC
2. **Server** → Generate presigned S3 upload URL
3. **Client** → Upload file directly to S3 (with progress)
4. **Client** → Notify server of successful upload
5. **Server** → Create Video record in database

**Why Presigned URLs?**

- Client uploads directly to S3 (faster)
- No file passes through Next.js server (reduces load)
- Secure (presigned URL expires after time limit)
- Better progress tracking

---

## Tasks

### 1. Create S3 Utility Functions

Create `src/lib/s3.ts`:

```typescript
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/env";

// Initialize S3 client
export const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Generate unique S3 key for video file
 */
export function generateVideoS3Key(userId: string, filename: string): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);
  const extension = filename.split(".").pop() || "mp4";
  return `videos/${userId}/${timestamp}-${randomId}.${extension}`;
}

/**
 * Generate presigned URL for uploading to S3
 */
export async function getUploadPresignedUrl(
  key: string,
  contentType: string,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  // URL expires in 10 minutes
  const presignedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 600,
  });

  return presignedUrl;
}

/**
 * Delete file from S3
 */
export async function deleteFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: env.AWS_S3_BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Get public URL for S3 object (for thumbnails, not videos)
 */
export function getS3Url(key: string): string {
  return `https://${env.AWS_S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
}
```

### 2. Create Video Router

Create `src/server/api/routers/video.ts`:

```typescript
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  generateVideoS3Key,
  getUploadPresignedUrl,
  deleteFromS3,
} from "@/lib/s3";
import { TRPCError } from "@trpc/server";

export const videoRouter = createTRPCRouter({
  /**
   * Get presigned URL for uploading video
   */
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileSize: z.number().positive(),
        mimeType: z.string().regex(/^video\//),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Validate file size (max 5GB)
      const maxSize = 5 * 1024 * 1024 * 1024; // 5GB
      if (input.fileSize > maxSize) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "File size exceeds 5GB limit",
        });
      }

      // Generate unique S3 key
      const s3Key = generateVideoS3Key(ctx.session.user.id, input.fileName);

      // Get presigned URL
      const uploadUrl = await getUploadPresignedUrl(s3Key, input.mimeType);

      return {
        uploadUrl,
        s3Key,
        s3Bucket: process.env.AWS_S3_BUCKET_NAME!,
      };
    }),

  /**
   * Confirm upload and create video record
   */
  confirmUpload: protectedProcedure
    .input(
      z.object({
        s3Key: z.string(),
        s3Bucket: z.string(),
        fileName: z.string(),
        fileSize: z.number().positive(),
        mimeType: z.string(),
        title: z.string().min(1).max(100),
        description: z.string().max(5000).optional(),
        tags: z.string().max(500).optional(),
        privacy: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]).default("UNLISTED"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Create video record
      const video = await ctx.db.video.create({
        data: {
          s3Key: input.s3Key,
          s3Bucket: input.s3Bucket,
          fileName: input.fileName,
          fileSize: BigInt(input.fileSize),
          mimeType: input.mimeType,
          title: input.title,
          description: input.description || null,
          tags: input.tags || null,
          privacy: input.privacy,
          createdById: ctx.session.user.id,
        },
      });

      return {
        id: video.id,
        title: video.title,
        createdAt: video.createdAt,
      };
    }),

  /**
   * Get all user's videos
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const videos = await ctx.db.video.findMany({
      where: {
        createdById: ctx.session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        fileName: true,
        fileSize: true,
        thumbnailUrl: true,
        privacy: true,
        createdAt: true,
        publishJobs: {
          select: {
            platform: true,
            status: true,
          },
        },
      },
    });

    // Convert BigInt to string for JSON serialization
    return videos.map((v) => ({
      ...v,
      fileSize: v.fileSize.toString(),
    }));
  }),

  /**
   * Delete video
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Get video
      const video = await ctx.db.video.findUnique({
        where: { id: input.id },
        select: {
          s3Key: true,
          createdById: true,
        },
      });

      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      // Ensure user owns the video
      if (video.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't own this video",
        });
      }

      // Delete from S3
      try {
        await deleteFromS3(video.s3Key);
      } catch (error) {
        console.error("Failed to delete from S3:", error);
        // Continue with DB deletion even if S3 fails
      }

      // Delete from database (cascade deletes publish jobs)
      await ctx.db.video.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
```

### 3. Add Video Router to Root

Update `src/server/api/root.ts`:

```typescript
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { postRouter } from "@/server/api/routers/post";
import { videoRouter } from "@/server/api/routers/video";

export const appRouter = createTRPCRouter({
  post: postRouter,
  video: videoRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
```

### 4. Create Upload Component

Create `src/app/_components/video-upload.tsx`:

```typescript
"use client";

import { useState } from "react";
import { api } from "@/trpc/react";

export function VideoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");

  const getUploadUrl = api.video.getUploadUrl.useMutation();
  const confirmUpload = api.video.confirmUpload.useMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Auto-fill title from filename
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const uploadToS3 = async (url: string, file: File) => {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed"));
      });

      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    });
  };

  const handleUpload = async () => {
    if (!file || !title) return;

    try {
      setIsUploading(true);
      setUploadStatus("uploading");
      setUploadProgress(0);

      // Step 1: Get presigned URL
      const { uploadUrl, s3Key, s3Bucket } = await getUploadUrl.mutateAsync({
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });

      // Step 2: Upload to S3
      await uploadToS3(uploadUrl, file);

      // Step 3: Confirm upload and create video record
      await confirmUpload.mutateAsync({
        s3Key,
        s3Bucket,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        title,
        description: description || undefined,
        privacy: "UNLISTED",
      });

      setUploadStatus("success");
      setUploadProgress(100);

      // Reset form
      setTimeout(() => {
        setFile(null);
        setTitle("");
        setDescription("");
        setUploadProgress(0);
        setUploadStatus("idle");
      }, 2000);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl rounded-lg border border-gray-700 bg-gray-800 p-6">
      <h2 className="mb-4 text-2xl font-bold">Upload Video</h2>

      {/* File Input */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium">Video File</label>
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="w-full rounded border border-gray-600 bg-gray-700 p-2"
        />
        {file && (
          <p className="mt-1 text-sm text-gray-400">
            {file.name} - {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        )}
      </div>

      {/* Title Input */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isUploading}
          className="w-full rounded border border-gray-600 bg-gray-700 p-2"
          placeholder="My awesome video"
        />
      </div>

      {/* Description Input */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium">
          Description (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isUploading}
          rows={4}
          className="w-full rounded border border-gray-600 bg-gray-700 p-2"
          placeholder="Video description..."
        />
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="mb-4">
          <div className="mb-1 flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-700">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Status Messages */}
      {uploadStatus === "success" && (
        <div className="mb-4 rounded bg-green-900/50 p-3 text-green-200">
          ✅ Upload successful!
        </div>
      )}
      {uploadStatus === "error" && (
        <div className="mb-4 rounded bg-red-900/50 p-3 text-red-200">
          ❌ Upload failed. Please try again.
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!file || !title || isUploading}
        className="w-full rounded bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isUploading ? "Uploading..." : "Upload Video"}
      </button>
    </div>
  );
}
```

### 5. Create Upload Page

Create `src/app/upload/page.tsx`:

```typescript
import { VideoUpload } from "@/app/_components/video-upload";

export default function UploadPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container flex flex-col items-center gap-8 px-4 py-16">
        <h1 className="text-4xl font-bold">Upload Video</h1>
        <VideoUpload />
      </div>
    </main>
  );
}
```

---

## Testing

### Manual Testing

1. **Start dev server**: `npm run dev`
2. **Sign in** to create a session
3. **Navigate to** `/upload`
4. **Select a video file** (MP4 recommended)
5. **Fill in title** and description
6. **Click Upload** and watch progress bar
7. **Verify success** message appears
8. **Check S3 bucket** - file should be there
9. **Check database** - Video record should exist

### Test Script

Create `scripts/test-upload.ts`:

```typescript
import { api } from "@/trpc/server";

async function testUpload() {
  try {
    // Test 1: Get upload URL
    console.log("Test 1: Getting upload URL...");
    const urlData = await api.video.getUploadUrl({
      fileName: "test.mp4",
      fileSize: 1024000,
      mimeType: "video/mp4",
    });
    console.log("✅ Got upload URL:", urlData.s3Key);

    // Test 2: List videos
    console.log("\nTest 2: Listing videos...");
    const videos = await api.video.list();
    console.log(`✅ Found ${videos.length} videos`);

    console.log("\n✅ All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testUpload();
```

---

## File Size Limits

**Current limit**: 5GB per file

**To increase**:

1. Update validation in `videoRouter.getUploadUrl`
2. Consider S3 multipart upload for files > 5GB
3. Update client-side validation

**Browser limits**: Most browsers support large file uploads, but may timeout

---

## Common Issues

**CORS Errors**:

- Verify S3 bucket CORS configuration
- Check `AllowedOrigins` includes your dev URL
- Ensure `AllowedMethods` includes PUT

**Upload Hangs at 100%**:

- This is the confirmUpload step
- Check tRPC endpoint is responding
- Verify database connection

**File Not Appearing in S3**:

- Check AWS credentials
- Verify bucket name is correct
- Check IAM permissions

**Progress Bar Doesn't Update**:

- XMLHttpRequest needed for progress (not fetch)
- Ensure progress event listener is attached

---

## Checklist Summary

- [ ] S3 utility functions created (`src/lib/s3.ts`)
- [ ] Video router implemented (`src/server/api/routers/video.ts`)
- [ ] Video router added to app router
- [ ] Upload component created
- [ ] Upload page created
- [ ] Manual upload test successful
- [ ] Video record created in database
- [ ] File visible in S3 bucket
- [ ] Progress tracking working

**Estimated Completion**: ✅ 4-6 hours

---

## Next Step

Videos can now be uploaded! Next, build the video library UI:

👉 **[03-video-library.md](./03-video-library.md)** - Display uploaded videos with metadata and publish status
