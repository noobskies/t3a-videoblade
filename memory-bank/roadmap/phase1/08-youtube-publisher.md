# Phase 1: YouTube API Publisher

## Goal

Implement actual YouTube video upload using YouTube Data API v3.

**Estimated Time**: 4-6 hours

---

## Prerequisites

- [x] 04-youtube-oauth.md - OAuth tokens available
- [x] 07-inngest-setup.md - Inngest function structure ready
- [x] YouTube Data API v3 enabled

---

## Tasks

### 1. Install googleapis Package

```bash
npm install googleapis
```

### 2. Create YouTube Service

Create `src/lib/youtube.ts`:

```typescript
import { google } from "googleapis";
import { env } from "@/env";

export async function uploadVideoToYouTube(params: {
  accessToken: string;
  refreshToken: string | null;
  s3Key: string;
  title: string;
  description?: string | null;
  tags?: string | null;
  privacy: "public" | "unlisted" | "private";
}) {
  // Initialize OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    `${env.BETTER_AUTH_URL}/api/auth/callback/google`,
  );

  oauth2Client.setCredentials({
    access_token: params.accessToken,
    refresh_token: params.refreshToken,
  });

  const youtube = google.youtube({ version: "v3", auth: oauth2Client });

  // Download video from S3
  const s3Client = (await import("@/lib/s3")).s3Client;
  const { GetObjectCommand } = await import("@aws-sdk/client-s3");

  const s3Response = await s3Client.send(
    new GetObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: params.s3Key,
    }),
  );

  if (!s3Response.Body) {
    throw new Error("Failed to download video from S3");
  }

  // Prepare tags
  const tags = params.tags ? params.tags.split(",").map((t) => t.trim()) : [];

  // Upload to YouTube
  const response = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title: params.title,
        description: params.description || "",
        tags,
        categoryId: "22", // People & Blogs (default)
      },
      status: {
        privacyStatus: params.privacy,
      },
    },
    media: {
      body: s3Response.Body as any, // Stream from S3
    },
  });

  const videoId = response.data.id;
  if (!videoId) {
    throw new Error("YouTube did not return video ID");
  }

  return {
    videoId,
    url: `https://www.youtube.com/watch?v=${videoId}`,
  };
}
```

### 3. Update Inngest Function

Update `src/inngest/publish-to-youtube.ts`:

```typescript
import { inngest } from "@/lib/inngest";
import { db } from "@/server/db";
import { uploadVideoToYouTube } from "@/lib/youtube";

export const publishToYouTubeFunction = inngest.createFunction(
  {
    id: "publish-to-youtube",
    name: "Publish Video to YouTube",
    retries: 3, // Retry 3 times on failure
  },
  { event: "video/publish.youtube" },
  async ({ event, step }) => {
    const { jobId } = event.data;

    // Step 1: Get job details
    const job = await step.run("get-job", async () => {
      const job = await db.publishJob.findUnique({
        where: { id: jobId },
        include: {
          video: true,
          platformConnection: true,
        },
      });

      if (!job) throw new Error("Job not found");

      await db.publishJob.update({
        where: { id: jobId },
        data: {
          status: "PROCESSING",
          startedAt: new Date(),
          retryCount: { increment: 1 },
        },
      });

      return job;
    });

    // Step 2: Upload video to YouTube
    const result = await step.run("upload-video", async () => {
      try {
        const result = await uploadVideoToYouTube({
          accessToken: job.platformConnection.accessToken,
          refreshToken: job.platformConnection.refreshToken,
          s3Key: job.video.s3Key,
          title: job.title || job.video.title,
          description: job.description || job.video.description,
          tags: job.tags || job.video.tags,
          privacy:
            (job.privacy?.toLowerCase() as "public" | "unlisted" | "private") ||
            (job.video.privacy.toLowerCase() as
              | "public"
              | "unlisted"
              | "private"),
        });

        return { success: true, ...result };
      } catch (error: any) {
        // Log error
        console.error("YouTube upload failed:", error);

        // Mark job as failed
        await db.publishJob.update({
          where: { id: jobId },
          data: {
            status: "FAILED",
            errorMessage: error.message,
            completedAt: new Date(),
          },
        });

        throw error; // Re-throw for Inngest retry
      }
    });

    // Step 3: Update job with success
    await step.run("update-job", async () => {
      await db.publishJob.update({
        where: { id: jobId },
        data: {
          status: "COMPLETED",
          platformVideoId: result.videoId,
          platformVideoUrl: result.url,
          completedAt: new Date(),
        },
      });
    });

    return result;
  },
);
```

---

## Testing

### Manual Test

1. **Upload a video** (small test video < 50MB)
2. **Connect YouTube** account
3. **Click Publish** on video
4. **Watch Inngest dashboard** for job progress
5. **Check YouTube** - video should appear
6. **Verify database** - job status = COMPLETED

### Test with Real Video

Use a short test video (10-30 seconds) to avoid long upload times during testing.

---

## YouTube API Quotas

**Important**: YouTube API has quotas!

- Default: 10,000 units/day
- Video upload costs: ~1,600 units
- Can upload ~6 videos/day

**To increase quota**:

1. Go to Google Cloud Console
2. Request quota increase
3. Explain your use case
4. Usually approved within 24-48 hours

---

## Common Issues

**401 Unauthorized**:

- Token expired - need refresh logic
- User revoked access
- Wrong scopes

**403 Forbidden**:

- Quota exceeded
- API not enabled
- Account restrictions

**Video upload fails**:

- File format not supported
- File too large (>256GB)
- Network timeout

**Token refresh needed**:
Better Auth handles this, but ensure refresh token exists.

---

## Checklist

- [ ] googleapis package installed
- [ ] YouTube service created
- [ ] Inngest function updated
- [ ] Test video uploaded successfully
- [ ] Video appears on YouTube
- [ ] Job status updates correctly
- [ ] Error handling works

**Estimated Completion**: ✅ 4-6 hours

---

## Next Step

👉 **[09-thumbnails.md](./09-thumbnails.md)** - Generate and display video thumbnails
