import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  generateVideoS3Key,
  getUploadPresignedUrl,
  deleteFromS3,
  getS3Url,
  getDownloadPresignedUrl,
} from "@/lib/s3";
import { TRPCError } from "@trpc/server";
import { env } from "@/env";
import { inngest } from "@/lib/inngest";

export const videoRouter = createTRPCRouter({
  /**
   * Get presigned URL for uploading video
   */
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileSize: z.number().positive(),
        mimeType: z.string().regex(/^video\//),
        thumbnailType: z.string().regex(/^image\//).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Validate file size (max 5GB)
      const maxSize = 5 * 1024 * 1024 * 1024; // 5GB
      if (input.fileSize > maxSize) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "File size exceeds 5GB limit",
        });
      }

      // Generate unique S3 key for video
      const s3Key = generateVideoS3Key(ctx.session.user.id, input.fileName);

      // Get presigned URL for video
      const uploadUrl = await getUploadPresignedUrl(s3Key, input.mimeType);

      // Handle thumbnail if present
      let thumbnailUploadUrl: string | undefined;
      let thumbnailS3Key: string | undefined;

      if (input.thumbnailType) {
        // Use same base name but with .jpg extension (or whatever input type is)
        const ext = input.thumbnailType.split("/")[1] ?? "jpg";
        thumbnailS3Key = s3Key.replace(/\.[^/.]+$/, `_thumb.${ext}`);
        thumbnailUploadUrl = await getUploadPresignedUrl(
          thumbnailS3Key,
          input.thumbnailType,
        );
      }

      return {
        uploadUrl,
        s3Key,
        s3Bucket: env.AWS_S3_BUCKET_NAME,
        thumbnailUploadUrl,
        thumbnailS3Key,
      };
    }),

  /**
   * Confirm upload and create video record
   */
  confirmUpload: protectedProcedure
    .input(
      z.object({
        s3Key: z.string(),
        s3Bucket: z.string(),
        fileName: z.string(),
        fileSize: z.number().positive(),
        mimeType: z.string(),
        title: z.string().min(1).max(100),
        description: z.string().max(5000).optional(),
        tags: z.string().max(500).optional(),
        privacy: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]).default("UNLISTED"),
        thumbnailS3Key: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Create video record
      const video = await ctx.db.video.create({
        data: {
          s3Key: input.s3Key,
          s3Bucket: input.s3Bucket,
          fileName: input.fileName,
          fileSize: BigInt(input.fileSize),
          mimeType: input.mimeType,
          title: input.title,
          description: input.description ?? null,
          tags: input.tags ?? null,
          privacy: input.privacy,
          thumbnailUrl: input.thumbnailS3Key
            ? getS3Url(input.thumbnailS3Key)
            : null,
          createdById: ctx.session.user.id,
        },
      });

      return {
        id: video.id,
        title: video.title,
        createdAt: video.createdAt,
      };
    }),

  /**
   * Get all user's videos
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const videos = await ctx.db.video.findMany({
      where: {
        createdById: ctx.session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        fileName: true,
        fileSize: true,
        thumbnailUrl: true,
        privacy: true,
        createdAt: true,
        publishJobs: {
          select: {
            id: true,
            platform: true,
            status: true,
            errorMessage: true,
          },
        },
      },
    });

    // Process videos to sign S3 thumbnail URLs
    const processedVideos = await Promise.all(
      videos.map(async (v) => {
        let thumbnailUrl = v.thumbnailUrl;

        // If thumbnail is on S3 (private bucket), generate signed URL
        if (thumbnailUrl?.includes("amazonaws.com")) {
          try {
            const url = new URL(thumbnailUrl);
            // Extract key from pathname (remove leading slash)
            const key = decodeURIComponent(url.pathname.substring(1));
            thumbnailUrl = await getDownloadPresignedUrl(key);
          } catch (error) {
            console.error("Failed to sign thumbnail URL:", error);
          }
        }

        return {
          ...v,
          thumbnailUrl,
          fileSize: v.fileSize.toString(),
        };
      }),
    );

    return processedVideos;
  }),

  /**
   * Get single video details
   */
  get: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const video = await ctx.db.video.findUnique({
        where: { id: input.id },
        include: {
          publishJobs: {
            include: {
              platformConnection: true,
            },
          },
        },
      });

      if (!video || video.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      let thumbnailUrl = video.thumbnailUrl;

      // If thumbnail is on S3 (private bucket), generate signed URL
      if (thumbnailUrl?.includes("amazonaws.com")) {
        try {
          const url = new URL(thumbnailUrl);
          const key = decodeURIComponent(url.pathname.substring(1));
          thumbnailUrl = await getDownloadPresignedUrl(key);
        } catch (error) {
          console.error("Failed to sign thumbnail URL:", error);
        }
      }

      return {
        ...video,
        thumbnailUrl,
        fileSize: video.fileSize.toString(),
      };
    }),

  /**
   * Update video metadata
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        title: z.string().min(1).max(100).optional(),
        description: z.string().max(5000).optional(),
        tags: z.string().max(500).optional(),
        privacy: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Verify ownership
      const video = await ctx.db.video.findUnique({
        where: { id },
        select: { createdById: true },
      });

      if (!video || video.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't own this video",
        });
      }

      // Update video
      const updated = await ctx.db.video.update({
        where: { id },
        data: updateData,
      });

      return {
        ...updated,
        fileSize: updated.fileSize.toString(),
      };
    }),

  /**
   * Delete video
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Get video
      const video = await ctx.db.video.findUnique({
        where: { id: input.id },
        select: {
          s3Key: true,
          createdById: true,
        },
      });

      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      // Ensure user owns the video
      if (video.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't own this video",
        });
      }

      // Delete from S3
      try {
        await deleteFromS3(video.s3Key);
      } catch (error) {
        console.error("Failed to delete from S3:", error);
        // Continue with DB deletion even if S3 fails
      }

      // Delete from database (cascade deletes publish jobs)
      await ctx.db.video.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Trigger publish job for video
   * Smart publish: Creates new video OR updates existing video on platform
   */
  publish: protectedProcedure
    .input(
      z.object({
        videoId: z.string().cuid(),
        platformConnectionId: z.string().cuid(),
        title: z.string().min(1).max(100).optional(),
        description: z.string().max(5000).optional(),
        tags: z.string().max(500).optional(),
        privacy: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user owns the video
      const video = await ctx.db.video.findUnique({
        where: { id: input.videoId },
        select: { createdById: true },
      });

      if (!video || video.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't own this video",
        });
      }

      // Verify user owns the platform connection
      const platformConnection = await ctx.db.platformConnection.findUnique({
        where: { id: input.platformConnectionId },
        select: { userId: true, platform: true },
      });

      if (
        !platformConnection ||
        platformConnection.userId !== ctx.session.user.id
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Platform connection not found",
        });
      }

      // Check if video has already been published to this platform
      const existingJob = await ctx.db.publishJob.findFirst({
        where: {
          videoId: input.videoId,
          platformConnectionId: input.platformConnectionId,
          status: "COMPLETED",
          platformVideoId: { not: null },
        },
        orderBy: { completedAt: "desc" },
      });

      const isUpdate = !!existingJob;

      // Create publish job (either upload or update)
      const job = await ctx.db.publishJob.create({
        data: {
          platform: platformConnection.platform,
          status: "PENDING",
          videoId: input.videoId,
          platformConnectionId: input.platformConnectionId,
          createdById: ctx.session.user.id,
          title: input.title,
          description: input.description,
          tags: input.tags,
          privacy: input.privacy,
          isUpdate,
          updateTargetVideoId: existingJob?.platformVideoId ?? null,
        },
      });

      // Trigger appropriate Inngest function
      if (platformConnection.platform === "YOUTUBE") {
        await inngest.send({
          name: isUpdate ? "video/update.youtube" : "video/publish.youtube",
          data: { jobId: job.id },
        });
      } else if (platformConnection.platform === "TIKTOK") {
        // TikTok doesn't support update yet
        await inngest.send({
          name: "video/publish.tiktok",
          data: { jobId: job.id },
        });
      } else {
        // Fallback or error for unsupported platforms
        // Currently we only have YouTube and TikTok implemented
      }

      return {
        jobId: job.id,
        status: job.status,
        isUpdate,
      };
    }),

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
      if (job.platform === "YOUTUBE") {
        await inngest.send({
          name: job.isUpdate ? "video/update.youtube" : "video/publish.youtube",
          data: { jobId: input.jobId },
        });
      } else if (job.platform === "TIKTOK") {
        await inngest.send({
          name: "video/publish.tiktok",
          data: { jobId: input.jobId },
        });
      }

      return { success: true };
    }),
});
