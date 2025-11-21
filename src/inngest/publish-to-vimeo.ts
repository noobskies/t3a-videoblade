import { inngest } from "@/lib/inngest";
import { uploadVideoToVimeo } from "@/lib/vimeo";
import { db } from "@/server/db";
import { NonRetriableError } from "inngest";

export const publishToVimeo = inngest.createFunction(
  { id: "publish-to-vimeo", name: "Publish Video to Vimeo", retries: 3 },
  { event: "video/publish.vimeo" },
  async ({ event, step }) => {
    const { jobId } = event.data as { jobId: string };

    // 1. Get job details
    const job = await step.run("get-job", async () => {
      const job = await db.publishJob.findUnique({
        where: { id: jobId },
        include: {
          post: true,
          platformConnection: true,
        },
      });

      if (!job) {
        throw new NonRetriableError(`Job not found: ${jobId}`);
      }

      if (job.platformConnection.platform !== "VIMEO") {
        throw new NonRetriableError("Invalid platform connection");
      }

      return job;
    });

    // 2. Handle scheduling
    if (job.scheduledFor && new Date(job.scheduledFor) > new Date()) {
      await step.run("mark-scheduled", async () => {
        await db.publishJob.update({
          where: { id: jobId },
          data: { status: "SCHEDULED" },
        });
      });

      await step.sleepUntil("wait-for-schedule", job.scheduledFor);
    }

    // 3. Start processing
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

    // 4. Upload to Vimeo
    const result = await step.run("upload-to-vimeo", async () => {
      try {
        // Ensure s3Key is present
        if (!job.post.s3Key) throw new Error("Missing S3 key for video post");

        const privacy =
          (job.privacy?.toLowerCase() as
            | "public"
            | "unlisted"
            | "private"
            | "disable") ??
          (job.post.privacy === "PUBLIC"
            ? "public"
            : job.post.privacy === "PRIVATE"
              ? "private"
              : "unlisted");

        const uploadResult = await uploadVideoToVimeo({
          accessToken: job.platformConnection.accessToken,
          s3Key: job.post.s3Key,
          title: job.title ?? job.post.title ?? "Untitled",
          description: job.description ?? job.post.description,
          privacy: privacy,
        });

        return uploadResult;
      } catch (error) {
        // Capture error message for DB update
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        // Mark job as failed
        await db.publishJob.update({
          where: { id: jobId },
          data: {
            status: "FAILED",
            errorMessage,
            completedAt: new Date(),
          },
        });

        throw new Error(errorMessage); // Re-throw to trigger retries
      }
    });

    // 5. Update Job Status to COMPLETED
    await step.run("update-job-status-completed", async () => {
      await db.publishJob.update({
        where: { id: jobId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          platformVideoId: result.videoId,
          platformVideoUrl: result.url,
        },
      });
    });

    return { success: true, videoId: result.videoId };
  },
);
