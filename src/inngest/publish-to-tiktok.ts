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
    const { jobId } = event.data as { jobId: string };

    // Step 1: Get job details
    const job = await step.run("get-job", async () => {
      const job = await db.publishJob.findUnique({
        where: { id: jobId },
        include: {
          post: true,
          platformConnection: true,
        },
      });

      if (!job) throw new Error("Job not found");
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

    // Step 4: Upload to TikTok
    const { publishId } = await step.run("upload-video", async () => {
      try {
        // Map privacy settings
        let privacy = "SELF_ONLY";
        if (job.privacy === "PUBLIC") privacy = "PUBLIC_TO_EVERYONE";
        else if (job.privacy === "MUTUAL_FOLLOW_FRIENDS")
          privacy = "MUTUAL_FOLLOW_FRIENDS";

        // TikTok doesn't have "UNLISTED", map to SELF_ONLY (Private)

        // Ensure s3Key is present
        if (!job.post.s3Key) throw new Error("Missing S3 key for video post");

        return await publishToTikTok({
          accessToken: job.platformConnection.accessToken,
          s3Key: job.post.s3Key,
          title: job.title ?? job.post.title ?? "Untitled",
          description: job.description ?? job.post.description,
          privacy: privacy as
            | "PUBLIC_TO_EVERYONE"
            | "MUTUAL_FOLLOW_FRIENDS"
            | "SELF_ONLY",
        });
      } catch (error: unknown) {
        console.error("TikTok upload failed:", error);
        await db.publishJob.update({
          where: { id: jobId },
          data: {
            status: "FAILED",
            errorMessage:
              error instanceof Error ? error.message : "Unknown error",
            completedAt: new Date(),
          },
        });
        throw error;
      }
    });

    // Step 5: Update job with publish ID
    await step.run("save-publish-id", async () => {
      await db.publishJob.update({
        where: { id: jobId },
        data: {
          platformVideoId: publishId, // Store publish_id temporarily as ID
        },
      });
    });

    // Step 6: Poll for status (TikTok processing takes time)
    // This might need a separate delayed function or loop with sleep
    // For MVP, we mark as "PROCESSING" and wait

    await step.sleep("wait-for-processing", "30s");

    const status = await step.run("check-status", async () => {
      const result = await checkTikTokStatus(
        job.platformConnection.accessToken,
        publishId,
      );

      if (result.data.status === "PUBLISH_COMPLETE") {
        await db.publishJob.update({
          where: { id: jobId },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
            // publicaly_available_post_id might be available now
          },
        });
      } else if (result.data.status === "FAILED") {
        const errorMsg = `TikTok processing failed: ${result.data.fail_reason}`;
        await db.publishJob.update({
          where: { id: jobId },
          data: {
            status: "FAILED",
            errorMessage: errorMsg,
            completedAt: new Date(),
          },
        });
        throw new Error(errorMsg);
      }

      return result.data;
    });

    return status;
  },
);
