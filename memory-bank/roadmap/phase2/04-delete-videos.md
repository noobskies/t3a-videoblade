# Phase 2: Delete Videos

## Goal

Allow users to delete videos from the library, including S3 storage and database records.

**Estimated Time**: 2 hours

---

## Prerequisites

- [x] Phase 1 complete - Video library exists
- [x] Delete procedure from Phase 1 (already implemented!)

---

## What's Already Done

✅ Delete functionality was already implemented in Phase 1!

- Video router has `delete` procedure
- Deletes from S3
- Deletes from database (cascades to publish jobs)
- Video card has delete button

---

## Enhancements for Phase 2

### 1. Improve Delete Confirmation

Update `src/app/_components/video-card.tsx` with better confirmation:

```typescript
const handleDelete = async () => {
  const confirmed = window.confirm(
    `Delete "${video.title}"?\n\n` +
      `This will:\n` +
      `- Remove video from VideoBlade\n` +
      `- Delete file from storage\n` +
      `- Cancel any pending publishes\n\n` +
      `Videos already published to platforms will remain there.\n\n` +
      `This action cannot be undone!`,
  );

  if (!confirmed) return;

  setIsDeleting(true);
  try {
    await deleteVideo.mutateAsync({ id: video.id });
    onDelete();
  } catch (error) {
    console.error("Delete failed:", error);
    alert("Failed to delete video");
  } finally {
    setIsDeleting(false);
  }
};
```

### 2. Optional: Delete from Platforms

Add option to also delete from published platforms:

```typescript
/**
 * Delete video and optionally from platforms
 */
deleteWithPlatforms: protectedProcedure
  .input(
    z.object({
      id: z.string().cuid(),
      deletePlatformVideos: z.boolean().default(false),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const video = await ctx.db.video.findUnique({
      where: { id: input.id },
      include: {
        publishJobs: {
          where: { status: "COMPLETED" },
          include: { platformConnection: true },
        },
      },
    });

    if (!video || video.createdById !== ctx.session.user.id) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    // Delete from platforms if requested
    if (input.deletePlatformVideos) {
      for (const job of video.publishJobs) {
        try {
          if (job.platform === "YOUTUBE" && job.platformVideoId) {
            // Delete from YouTube
            // await deleteFromYouTube(job.platformConnection.accessToken, job.platformVideoId);
          }
          if (job.platform === "TIKTOK" && job.platformVideoId) {
            // Delete from TikTok
            // Note: TikTok Content Posting API may not support deletion via API currently.
            // We need to check docs or just handle local deletion.
            // await deleteFromTikTok(job.platformConnection.accessToken, job.platformVideoId);
          }
        } catch (error) {
          console.error(`Failed to delete from ${job.platform}:`, error);
          // Continue anyway
        }
      }
    }

    // Delete from S3
    try {
      await deleteFromS3(video.s3Key);
    } catch (error) {
      console.error("Failed to delete from S3:", error);
    }

    // Delete from database
    await ctx.db.video.delete({
      where: { id: input.id },
    });

    return { success: true };
  }),
```

---

## Features

✅ **Basic Delete** (already working):

- Delete button in video card
- Confirmation dialog
- Deletes from S3
- Deletes from database

✅ **Enhanced Delete** (Phase 2):

- Better confirmation message
- Shows what will be deleted
- Optional: Delete from platforms too

---

## Testing

1. **Upload a video**
2. **Publish to platform** (optional)
3. **Click delete** button
4. **Confirm deletion**
5. **Verify**:
   - Video removed from library
   - File deleted from S3
   - Database record gone
   - Publish jobs deleted (cascade)

---

## Common Issues

**S3 Delete Fails**:

- Check IAM permissions
- Video may already be deleted
- Continue with DB deletion anyway

**Platform Delete Fails**:

- Platform API may not support deletion
- Video may already be deleted
- User may have deleted manually

---

## Checklist

- [x] Basic delete working (Phase 1)
- [ ] Enhanced confirmation dialog
- [ ] Optional platform deletion
- [ ] Test delete workflow
- [ ] S3 cleanup verified
- [ ] Database cleanup verified

**Estimated Completion**: ✅ 2 hours

---

## Next Step

👉 **[05-scheduling.md](./05-scheduling.md)** - Add scheduled publishing feature
