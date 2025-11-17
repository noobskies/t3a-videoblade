# Phase 1: Inngest Setup

## Goal

Set up Inngest for background job processing to handle video publishing to YouTube.

**Estimated Time**: 3-4 hours

---

## Prerequisites

- [x] 00-prerequisites.md - Inngest credentials configured
- [x] Inngest package installed

---

## What is Inngest?

Inngest is a serverless queueing system that handles background jobs. Perfect for:

- Long-running tasks (video uploads)
- Retry logic
- Scheduled jobs
- No separate Redis/worker infrastructure needed

---

## Tasks

### 1. Create Inngest Client

Create `src/lib/inngest.ts`:

```typescript
import { Inngest } from "inngest";
import { env } from "@/env";

export const inngest = new Inngest({
  id: "videoblade",
  eventKey: env.INNGEST_EVENT_KEY,
});
```

### 2. Create Inngest API Route

Create `src/app/api/inngest/route.ts`:

```typescript
import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { publishToYouTubeFunction } from "@/inngest/publish-to-youtube";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    publishToYouTubeFunction,
    // Add more functions here as needed
  ],
});
```

### 3. Create Publish Function

Create `src/inngest/publish-to-youtube.ts`:

```typescript
import { inngest } from "@/lib/inngest";
import { db } from "@/server/db";

export const publishToYouTubeFunction = inngest.createFunction(
  { id: "publish-to-youtube", name: "Publish Video to YouTube" },
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

      // Update status to PROCESSING
      await db.publishJob.update({
        where: { id: jobId },
        data: { status: "PROCESSING", startedAt: new Date() },
      });

      return job;
    });

    // Step 2: Upload video to YouTube
    const result = await step.run("upload-video", async () => {
      // YouTube API upload logic will go here
      // For now, return placeholder
      return {
        videoId: "test-video-id",
        url: "https://youtube.com/watch?v=test",
      };
    });

    // Step 3: Update job with result
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

    return { success: true, videoId: result.videoId };
  },
);
```

### 4. Create Trigger Procedure

Add to `src/server/api/routers/video.ts`:

```typescript
import { inngest } from "@/lib/inngest";

/**
 * Trigger publish job
 */
publish: protectedProcedure
  .input(
    z.object({
      videoId: z.string().cuid(),
      platformConnectionId: z.string().cuid(),
      title: z.string().optional(),
      description: z.string().optional(),
      privacy: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]).optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    // Create publish job
    const job = await ctx.db.publishJob.create({
      data: {
        platform: "YOUTUBE",
        status: "PENDING",
        videoId: input.videoId,
        platformConnectionId: input.platformConnectionId,
        createdById: ctx.session.user.id,
        title: input.title,
        description: input.description,
        privacy: input.privacy,
      },
    });

    // Trigger Inngest function
    await inngest.send({
      name: "video/publish.youtube",
      data: { jobId: job.id },
    });

    return { jobId: job.id };
  }),
```

---

## Testing

### Test Inngest Setup

1. **Start dev server**: `npm run dev`
2. **Visit**: `http://localhost:3000/api/inngest`
3. **Should see**: Inngest endpoint info

### Test Job Trigger

```typescript
// In tRPC procedure or test script
await inngest.send({
  name: "video/publish.youtube",
  data: { jobId: "test-job-id" },
});
```

### Monitor Jobs

Visit Inngest dashboard:

- https://app.inngest.com/
- View function runs
- See success/failures
- Check logs

---

## Environment Variables

Ensure these are set:

```bash
INNGEST_EVENT_KEY="test_..."
INNGEST_SIGNING_KEY="signkey-..."
```

---

## Common Issues

**Inngest endpoint 404**:

- Check route file exists at `app/api/inngest/route.ts`
- Verify serve() is exported correctly

**Function not triggering**:

- Check event name matches exactly
- Verify Inngest client initialized
- Check Inngest dashboard for errors

**Local development**:

- Inngest Dev Server recommended for local testing
- Run: `npx inngest-cli dev`
- Connects to localhost:3000/api/inngest

---

## Checklist

- [ ] Inngest client created
- [ ] API route created
- [ ] Publish function created
- [ ] Trigger procedure added
- [ ] Inngest endpoint accessible
- [ ] Test job runs successfully
- [ ] Jobs visible in Inngest dashboard

**Estimated Completion**: ✅ 3-4 hours

---

## Next Step

👉 **[08-youtube-publisher.md](./08-youtube-publisher.md)** - Implement YouTube API video upload
