/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { inngest } from "@/lib/inngest";
import { db } from "@/server/db";
import { publishToLinkedIn } from "@/lib/linkedin";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/s3";
import { Readable } from "stream";
import { env } from "@/env";

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk as Uint8Array)));
    stream.on("error", (err) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

export const publishToLinkedInFunction = inngest.createFunction(
  {
    id: "publish-to-linkedin",
    name: "Publish to LinkedIn",
    retries: 3,
  },
  { event: "post/publish.linkedin" },
  async ({ event, step }) => {
    const { jobId } = event.data;

    // Step 1: Get job details
    const job = await step.run("get-job", async () => {
      const job = await db.publishJob.findUnique({
        where: { id: jobId },
        include: {
          post: true,
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

    // Step 4: Publish to LinkedIn
    const result = await step.run("publish-content", async () => {
      try {
        // Determine content type
        const contentText = job.title
          ? `${job.title}\n\n${job.description ?? ""}`
          : (job.description ?? job.post.content ?? "");

        if (!contentText && job.post.type === "TEXT") {
          throw new Error("No content to publish");
        }

        let media:
          | {
              type: "IMAGE" | "VIDEO";
              buffer: Buffer;
              mimeType: string;
              title?: string;
            }
          | undefined;

        // Handle Media Fetching
        if (job.post.type === "IMAGE" || job.post.type === "VIDEO") {
          if (!job.post.s3Key) {
            throw new Error("Missing S3 key for media post");
          }

          console.log(`Fetching media from S3: ${job.post.s3Key}`);
          const command = new GetObjectCommand({
            Bucket: env.AWS_S3_BUCKET_NAME,
            Key: job.post.s3Key,
          });

          const s3Response = await s3Client.send(command);
          if (!s3Response.Body) {
            throw new Error("Empty S3 Body");
          }

          // Convert stream to buffer
          // AWS SDK v3 returns a specific stream type in Node
          const buffer = await streamToBuffer(s3Response.Body as Readable);

          media = {
            type: job.post.type,
            buffer,
            mimeType:
              job.post.mimeType ??
              (job.post.type === "IMAGE" ? "image/jpeg" : "video/mp4"),
            title: job.title ?? undefined,
          };
        }

        const result = await publishToLinkedIn(
          job.platformConnection.accessToken,
          job.platformConnection.platformUserId,
          {
            text: contentText || "Shared via MediaBlade", // Fallback if text is empty but media exists
            media,
          },
        );

        return { success: true, ...result };
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error("LinkedIn publish failed:", errorMessage);

        await db.publishJob.update({
          where: { id: jobId },
          data: {
            status: "FAILED",
            errorMessage,
            completedAt: new Date(),
          },
        });

        throw error;
      }
    });

    // Step 5: Update job with success
    await step.run("update-job", async () => {
      await db.publishJob.update({
        where: { id: jobId },
        data: {
          status: "COMPLETED",
          platformVideoId: result.id,
          platformVideoUrl: result.url,
          completedAt: new Date(),
        },
      });
    });

    return result;
  },
);
