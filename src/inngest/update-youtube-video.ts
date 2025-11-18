/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Note: Prisma generated types cause ESLint false positives. Types are actually safe.

import { inngest } from "@/lib/inngest";
import { db } from "@/server/db";
import { updateVideoOnYouTube } from "@/lib/youtube";

/**
 * Inngest function to update a video's metadata on YouTube
 *
 * This function handles updating existing YouTube videos without re-uploading:
 * 1. Fetching job details from database
 * 2. Updating video metadata on YouTube via API
 * 3. Updating job status with results
 *
 * Each step is automatically retried on failure by Inngest
 */
export const updateYouTubeVideoFunction = inngest.createFunction(
  {
    id: "update-youtube-video",
    name: "Update Video on YouTube",
    retries: 3, // Retry 3 times on failure
  },
  { event: "video/update.youtube" },
  async ({ event, step }) => {
    const { jobId } = event.data;

    // Step 1: Get job details and update status to PROCESSING
    const job = await step.run("get-job", async () => {
      const job = await db.publishJob.findUnique({
        where: { id: jobId },
        include: {
          video: true,
          platformConnection: true,
        },
      });

      if (!job) {
        throw new Error(`Job not found: ${jobId}`);
      }

      if (!job.isUpdate || !job.updateTargetVideoId) {
        throw new Error(
          `Job ${jobId} is not configured as an update operation`,
        );
      }

      // Update status to PROCESSING
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

    // Step 2: Update video on YouTube
    const result = await step.run("update-video", async () => {
      try {
        const result = await updateVideoOnYouTube({
          accessToken: job.platformConnection.accessToken,
          refreshToken: job.platformConnection.refreshToken,
          videoId: job.updateTargetVideoId!, // YouTube video ID to update
          title: job.title ?? job.video.title,
          description: job.description ?? job.video.description,
          tags: job.tags ?? job.video.tags,
          privacy:
            (job.privacy?.toLowerCase() as "public" | "unlisted" | "private") ??
            (job.video.privacy.toLowerCase() as
              | "public"
              | "unlisted"
              | "private"),
        });

        return { success: true, ...result };
      } catch (error: unknown) {
        // Log error
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error("YouTube update failed:", errorMessage);

        // Mark job as failed
        await db.publishJob.update({
          where: { id: jobId },
          data: {
            status: "FAILED",
            errorMessage,
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
