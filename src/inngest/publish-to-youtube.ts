/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Note: Prisma generated types cause ESLint false positives. Types are actually safe.

import { inngest } from "@/lib/inngest";
import { db } from "@/server/db";
import { uploadVideoToYouTube } from "@/lib/youtube";

/**
 * Inngest function to publish a video to YouTube
 *
 * This function handles the multi-step process of:
 * 1. Fetching job details from database
 * 2. Uploading video to YouTube via API
 * 3. Updating job status with results
 *
 * Each step is automatically retried on failure by Inngest
 */
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

      if (!job) {
        throw new Error(`Job not found: ${jobId}`);
      }
      return job;
    });

    // Step 2: Handle scheduling
    if (job.scheduledFor && new Date(job.scheduledFor) > new Date()) {
      await step.run("mark-scheduled", async () => {
        await db.publishJob.update({
          where: { id: jobId },
          data: { status: "SCHEDULED" },
        });
      });

      await step.sleepUntil("wait-for-schedule", job.scheduledFor);
    }

    // Step 3: Start processing
    await step.run("start-processing", async () => {
      await db.publishJob.update({
        where: { id: jobId },
        data: {
          status: "PROCESSING",
          startedAt: new Date(),
          retryCount: { increment: 1 },
        },
      });
    });

    // Step 4: Upload video to YouTube
    const result = await step.run("upload-video", async () => {
      try {
        const result = await uploadVideoToYouTube({
          accessToken: job.platformConnection.accessToken,
          refreshToken: job.platformConnection.refreshToken,
          s3Key: job.video.s3Key,
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
        console.error("YouTube upload failed:", errorMessage);

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

    // Step 5: Update job with success
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

    // Step 6: Update video with thumbnail (if successful)
    if (result.success && result.videoId) {
      await step.run("update-thumbnail", async () => {
        const thumbnailUrl = `https://img.youtube.com/vi/${result.videoId}/mqdefault.jpg`;

        await db.video.update({
          where: { id: job.videoId },
          data: { thumbnailUrl },
        });
      });
    }

    return result;
  },
);
