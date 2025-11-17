# Phase 1: Retry Failed Publishes

## Goal

Allow users to retry failed publish jobs from the UI.

**Estimated Time**: 2 hours

---

## Prerequisites

- [x] 07-inngest-setup.md - Inngest handles retries
- [x] 08-youtube-publisher.md - Publishing implemented
- [x] Video library shows publish status

---

## What's Already Done

✅ Inngest automatically retries failed jobs (configured with `retries: 3`)
✅ Failed jobs marked in database with error message
✅ Video cards show failed status

---

## Tasks

### 1. Add Retry Procedure

Add to `src/server/api/routers/video.ts`:

```typescript
/**
 * Retry failed publish job
 */
retryPublish: protectedProcedure
  .input(z.object({ jobId: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    // Get job
    const job = await ctx.db.publishJob.findUnique({
      where: { id: input.jobId },
    });

    if (!job) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    if (job.createdById !== ctx.session.user.id) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    // Reset job status
    await ctx.db.publishJob.update({
      where: { id: input.jobId },
      data: {
        status: "PENDING",
        errorMessage: null,
        startedAt: null,
        completedAt: null,
      },
    });

    // Trigger Inngest again
    await inngest.send({
      name: "video/publish.youtube",
      data: { jobId: input.jobId },
    });

    return { success: true };
  }),
```

### 2. Add Retry Button to Video Card

Update `src/app/_components/video-card.tsx`:

```typescript
const retryPublish = api.video.retryPublish.useMutation();

const handleRetry = async (jobId: string) => {
  try {
    await retryPublish.mutateAsync({ jobId });
    onDelete(); // Refetch to update status
    alert("Retrying publish...");
  } catch (error) {
    alert("Failed to retry");
  }
};

// In the component JSX, add retry button for failed jobs:
{video.publishJobs.some((j) => j.status === "FAILED") && (
  <button
    onClick={() => {
      const failedJob = video.publishJobs.find((j) => j.status === "FAILED");
      if (failedJob) handleRetry(failedJob.id);
    }}
    className="rounded bg-yellow-600 px-3 py-2 text-sm hover:bg-yellow-700"
  >
    Retry Failed
  </button>
)}
```

### 3. Show Error Message

Display error message in video card for failed jobs:

```typescript
{video.publishJobs
  .filter((j) => j.status === "FAILED")
  .map((job) => (
    <div key={job.id} className="mt-2 rounded bg-red-900/30 p-2 text-sm">
      <p className="font-semibold text-red-200">Failed: {job.platform}</p>
      {job.errorMessage && (
        <p className="text-xs text-red-300">{job.errorMessage}</p>
      )}
    </div>
  ))}
```

---

## Testing

1. **Cause a failure** (disconnect YouTube, or use invalid token)
2. **See FAILED status** in video card
3. **Click Retry** button
4. **Job should reprocess** and hopefully succeed
5. **Status updates** to COMPLETED

---

## Automatic Retries

**Inngest Configuration**:

- Retries: 3 times automatically
- Exponential backoff
- Manual retry always available

**Retry Strategy**:

1. **Automatic**: Inngest retries immediately on transient errors
2. **Manual**: User clicks retry for persistent issues

---

## Checklist

- [ ] Retry procedure added
- [ ] Retry button in video card
- [ ] Error message displayed
- [ ] Retry resets job status
- [ ] Inngest triggered again
- [ ] Status updates correctly

**Estimated Completion**: ✅ 2 hours

---

## 🎉 Phase 1 MVP Complete!

Congratulations! With all 10 files complete, you now have a full roadmap for:

✅ Infrastructure setup (AWS S3, Inngest, YouTube API)
✅ Database schema for videos and platforms
✅ Video upload to S3 with progress tracking
✅ Video library UI with management
✅ YouTube OAuth integration
✅ Platform connection management
✅ Video metadata editing
✅ Background job processing with Inngest
✅ YouTube video publishing
✅ Thumbnail display
✅ Retry logic for failures

---

## Next Phase

👉 **Phase 2: Rumble Integration** - See `../phase2/` for adding Rumble support and additional features like scheduling and deletion.

---

## Estimated Total Time for Phase 1

- Prerequisites: 2-4 hours
- Database Schema: 2-3 hours
- S3 Upload: 4-6 hours
- Video Library: 3-4 hours
- YouTube OAuth: 2 hours
- Platform Management: 2-3 hours
- Metadata Editing: 2-3 hours
- Inngest Setup: 3-4 hours
- YouTube Publisher: 4-6 hours
- Thumbnails: 2-3 hours
- Retry Logic: 2 hours

**Total: 28-42 hours** (~3-5 weeks part-time, ~1-2 weeks full-time)
