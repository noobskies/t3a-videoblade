# Phase 2: Rumble Video Publisher

## Goal

Implement Rumble video upload using Rumble API.

**Estimated Time**: 4-5 hours

---

## Prerequisites

- [x] 01-rumble-oauth.md - Rumble connection working
- [x] Phase 1 Inngest setup
- [x] S3 videos available

---

## Tasks

### 1. Create Rumble Service

Create `src/lib/rumble.ts`:

```typescript
import { env } from "@/env";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./s3";

export async function uploadVideoToRumble(params: {
  apiKey: string;
  s3Key: string;
  title: string;
  description?: string | null;
  tags?: string | null;
  privacy: "public" | "unlisted" | "private";
}) {
  // Download video from S3
  const s3Response = await s3Client.send(
    new GetObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: params.s3Key,
    }),
  );

  if (!s3Response.Body) {
    throw new Error("Failed to download video from S3");
  }

  // Convert stream to buffer (Rumble may need full file)
  const chunks: Uint8Array[] = [];
  for await (const chunk of s3Response.Body as any) {
    chunks.push(chunk);
  }
  const videoBuffer = Buffer.concat(chunks);

  // Upload to Rumble
  // Note: Adapt based on actual Rumble API
  const formData = new FormData();
  formData.append("video", new Blob([videoBuffer]), "video.mp4");
  formData.append("title", params.title);
  formData.append("description", params.description || "");
  formData.append("visibility", params.privacy);

  const response = await fetch("https://rumble.com/api/v1/videos/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Rumble upload failed: ${error}`);
  }

  const result = await response.json();

  return {
    videoId: result.video_id || result.id,
    url: result.url || `https://rumble.com/v${result.video_id}`,
  };
}
```

### 2. Create Rumble Inngest Function

Create `src/inngest/publish-to-rumble.ts`:

```typescript
import { inngest } from "@/lib/inngest";
import { db } from "@/server/db";
import { uploadVideoToRumble } from "@/lib/rumble";

export const publishToRumbleFunction = inngest.createFunction(
  {
    id: "publish-to-rumble",
    name: "Publish Video to Rumble",
    retries: 3,
  },
  { event: "video/publish.rumble" },
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

    // Step 2: Upload to Rumble
    const result = await step.run("upload-video", async () => {
      try {
        const result = await uploadVideoToRumble({
          apiKey: job.platformConnection.accessToken,
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
        console.error("Rumble upload failed:", error);

        await db.publishJob.update({
          where: { id: jobId },
          data: {
            status: "FAILED",
            errorMessage: error.message,
            completedAt: new Date(),
          },
        });

        throw error;
      }
    });

    // Step 3: Update job
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

### 3. Register Rumble Function

Update `src/app/api/inngest/route.ts`:

```typescript
import { publishToRumbleFunction } from "@/inngest/publish-to-rumble";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    publishToYouTubeFunction,
    publishToRumbleFunction, // Add this
  ],
});
```

### 4. Add Rumble Publish Option

Update video router to support Rumble:

```typescript
// In publish procedure, check platform
const platform = input.platform || "YOUTUBE"; // Add platform parameter

// Create job
const job = await ctx.db.publishJob.create({
  data: {
    platform, // Use selected platform
    // ... rest
  },
});

// Trigger appropriate function
const eventName =
  platform === "RUMBLE" ? "video/publish.rumble" : "video/publish.youtube";

await inngest.send({
  name: eventName,
  data: { jobId: job.id },
});
```

---

## Rumble-Specific Considerations

**File Format**: Rumble may prefer MP4 with H.264 codec
**File Size**: Check Rumble's limits (may differ from YouTube)
**Privacy Options**: Verify Rumble supports public/unlisted/private
**Metadata**: Rumble may have different required/optional fields

---

## Testing

1. **Connect Rumble** account
2. **Upload test video** (short, <50MB)
3. **Publish to Rumble**
4. **Watch Inngest** dashboard
5. **Check Rumble** - video should appear
6. **Verify database** - job status COMPLETED

---

## Common Issues

**API Endpoint Not Found**:

- Rumble API endpoints may change
- Check latest documentation
- May need to adapt URLs

**Upload Fails**:

- File format not supported
- File too large
- API rate limits

**Authentication Errors**:

- API key expired
- Wrong authentication method
- Need to refresh connection

---

## Checklist

- [ ] Rumble service created
- [ ] Rumble Inngest function created
- [ ] Function registered in route
- [ ] Publish procedure updated
- [ ] Test video published successfully
- [ ] Video appears on Rumble
- [ ] Job status updates correctly

**Estimated Completion**: ✅ 4-5 hours

---

## Next Step

👉 **[03-multi-platform-ui.md](./03-multi-platform-ui.md)** - Build UI for multi-platform publishing
