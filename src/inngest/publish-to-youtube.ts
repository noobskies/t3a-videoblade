import { inngest } from "@/lib/inngest";
import { db } from "@/server/db";
import type {
  Video,
  PlatformConnection,
  PublishJob,
} from "../../generated/prisma";

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
  },
  { event: "video/publish.youtube" },
  async ({ event, step }) => {
    const { jobId } = event.data;

    // Step 1: Get job details and update status to PROCESSING
    const job = await step.run(
      "get-job",
      async (): Promise<
        PublishJob & { video: Video; platformConnection: PlatformConnection }
      > => {
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

        // Update status to PROCESSING
        await db.publishJob.update({
          where: { id: jobId },
          data: {
            status: "PROCESSING",
            startedAt: new Date(),
          },
        });

        return job;
      },
    );

    // Step 2: Upload video to YouTube
    // TODO: Implement actual YouTube API upload in Step 8
    // For now, we use a placeholder that simulates a successful upload
    const result = await step.run("upload-video", async () => {
      // Placeholder for YouTube API upload
      // In Step 8, this will:
      // 1. Get OAuth tokens from platformConnection
      // 2. Download video from S3
      // 3. Upload to YouTube with metadata
      // 4. Return YouTube video ID and URL

      const videoId = `yt-${Date.now()}`;
      const url = `https://youtube.com/watch?v=${videoId}`;

      return {
        videoId,
        url,
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

    return {
      success: true,
      videoId: result.videoId,
      url: result.url,
    };
  },
);
