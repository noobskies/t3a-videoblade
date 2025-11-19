# Phase 2: TikTok Video Publisher

## Goal

Implement TikTok video upload using the Content Posting API.

**Estimated Time**: 4-5 hours

---

## Prerequisites

- [x] 01-tiktok-oauth.md - TikTok connection working
- [x] Phase 1 Inngest setup
- [x] S3 videos available

---

## Tasks

### 1. Create TikTok Service

Create `src/lib/tiktok.ts`:

```typescript
import { env } from "@/env";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./s3";

const TIKTOK_API_BASE = "https://open.tiktokapis.com/v2";

export async function publishToTikTok(params: {
  accessToken: string;
  s3Key: string;
  title: string;
  description?: string | null;
  privacy: "PUBLIC_TO_EVERYONE" | "MUTUAL_FOLLOW_FRIENDS" | "SELF_ONLY";
}) {
  // 1. Initialize Upload
  // POST /v2/post/publish/inbox/video/init/
  
  // Download video from S3 first to get size
  const s3Response = await s3Client.send(
    new GetObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: params.s3Key,
    }),
  );

  if (!s3Response.Body || !s3Response.ContentLength) {
    throw new Error("Failed to download video from S3");
  }
  
  const videoSize = s3Response.ContentLength;
  
  // Convert stream to buffer for upload
  const chunks: Uint8Array[] = [];
  for await (const chunk of s3Response.Body as any) {
    chunks.push(chunk);
  }
  const videoBuffer = Buffer.concat(chunks);

  const initResponse = await fetch(`${TIKTOK_API_BASE}/post/publish/inbox/video/init/`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${params.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source_info: {
        source: "FILE_UPLOAD",
        video_size: videoSize,
        chunk_size: videoSize, // Upload in one chunk for simplicity if size allows
        total_chunk_count: 1,
      },
    }),
  });

  if (!initResponse.ok) {
    const error = await initResponse.text();
    throw new Error(`TikTok init failed: ${error}`);
  }

  const initData = await initResponse.json();
  const { upload_url, publish_id } = initData.data;

  // 2. Upload Video
  // PUT {upload_url}
  
  const uploadResponse = await fetch(upload_url, {
    method: "PUT",
    headers: {
      "Content-Type": "video/mp4", // Or dynamic mime type
      "Content-Range": `bytes 0-${videoSize - 1}/${videoSize}`,
    },
    body: videoBuffer,
  });

  if (!uploadResponse.ok) {
    const error = await uploadResponse.text();
    throw new Error(`TikTok upload failed: ${error}`);
  }

  // 3. Check Status (Optional here, handled by polling later)
  // But we return publish_id so we can poll it

  return {
    publishId: publish_id,
  };
}

export async function checkTikTokStatus(accessToken: string, publishId: string) {
  const response = await fetch(`${TIKTOK_API_BASE}/post/publish/status/fetch/`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      publish_id: publishId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to check status");
  }

  return await response.json();
}
```

### 2. Create TikTok Inngest Function

Create `src/inngest/publish-to-tiktok.ts`:

```typescript
import { inngest } from "@/lib/inngest";
import { db } from "@/server/db";
import { publishToTikTok, checkTikTokStatus } from "@/lib/tiktok";

export const publishToTikTokFunction = inngest.createFunction(
  {
    id: "publish-to-tiktok",
    name: "Publish Video to TikTok",
    retries: 3,
  },
  { event: "video/publish.tiktok" },
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

    // Step 2: Upload to TikTok
    const { publishId } = await step.run("upload-video", async () => {
      try {
        // Map privacy settings
        let privacy = "SELF_ONLY";
        if (job.privacy === "PUBLIC") privacy = "PUBLIC_TO_EVERYONE";
        // TikTok doesn't have "UNLISTED" exactly, maybe mapping to private or mutual friends
        
        return await publishToTikTok({
          accessToken: job.platformConnection.accessToken,
          s3Key: job.video.s3Key,
          title: job.title || job.video.title,
          description: job.description || job.video.description,
          privacy: privacy as any,
        });
      } catch (error: any) {
        console.error("TikTok upload failed:", error);
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

    // Step 3: Update job with publish ID
    await step.run("save-publish-id", async () => {
      await db.publishJob.update({
        where: { id: jobId },
        data: {
          platformVideoId: publishId, // Store publish_id temporarily as ID
        },
      });
    });

    // Step 4: Poll for status (TikTok processing takes time)
    // This might need a separate delayed function or loop with sleep
    // For MVP, we might mark as "PROCESSING" and let user check later, 
    // or use step.sleep()
    
    await step.sleep("wait-for-processing", "30s");
    
    const status = await step.run("check-status", async () => {
       const result = await checkTikTokStatus(job.platformConnection.accessToken, publishId);
       // Parse result.data.status (PROCESSING_UPLOAD, PUBLISH_COMPLETE, FAILED)
       
       if (result.data.status === 'PUBLISH_COMPLETE') {
           await db.publishJob.update({
            where: { id: jobId },
            data: {
              status: "COMPLETED",
              completedAt: new Date(),
              // publicaly_available_post_id might be available now
            },
          });
       } else if (result.data.status === 'FAILED') {
           throw new Error(`TikTok processing failed: ${result.data.fail_reason}`);
       }
       
       return result.data;
    });

    return status;
  },
);
```

### 3. Register TikTok Function

Update `src/app/api/inngest/route.ts`:

```typescript
import { publishToTikTokFunction } from "@/inngest/publish-to-tiktok";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    publishToYouTubeFunction,
    publishToTikTokFunction, // Add this
  ],
});
```

### 4. Add TikTok Publish Option

Update video router to support TikTok:

```typescript
// In publish procedure
const eventName =
  platform === "TIKTOK" ? "video/publish.tiktok" : "video/publish.youtube";

await inngest.send({
  name: eventName,
  data: { jobId: job.id },
});
```

---

## TikTok-Specific Considerations

**Upload Flow**: Init -> Upload -> Status Check. It is asynchronous.
**File Size**: Ensure S3 download and memory usage is handled (may need streaming for larger files).
**Privacy**: Options are stricter (`PUBLIC_TO_EVERYONE`, `MUTUAL_FOLLOW_FRIENDS`, `SELF_ONLY`).
**Rate Limits**: Be aware of upload quotas.

---

## Testing

1. **Connect TikTok** account
2. **Upload test video**
3. **Publish to TikTok**
4. **Watch Inngest** logs
5. **Verify on TikTok app**

---

## Checklist

- [ ] TikTok service created
- [ ] TikTok Inngest function created
- [ ] Function registered in route
- [ ] Publish procedure updated
- [ ] Test video published successfully
- [ ] Job status updates correctly

**Estimated Completion**: ✅ 4-5 hours

---

## Next Step

👉 **[03-multi-platform-ui.md](./03-multi-platform-ui.md)** - Build UI for multi-platform publishing
