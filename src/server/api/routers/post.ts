import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  generateVideoS3Key,
  getUploadPresignedUrl,
  deleteFromS3,
  getS3Url,
  getDownloadPresignedUrl,
} from "@/lib/s3";
import { deleteVideoFromYouTube } from "@/lib/youtube";
import { TRPCError } from "@trpc/server";
import { env } from "@/env";
import { inngest } from "@/lib/inngest";
import { UPLOAD_LIMITS } from "@/lib/constants";

export const postRouter = createTRPCRouter({
  /**
   * Get presigned URL for uploading media (Video or Image)
   */
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileSize: z.number().positive(),
        mimeType: z.string().regex(/^(video|image)\//),
        thumbnailType: z
          .string()
          .regex(/^image\//)
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const isVideo = input.mimeType.startsWith("video/");
      const limit = isVideo
        ? UPLOAD_LIMITS.VIDEO.MAX_SIZE
        : UPLOAD_LIMITS.IMAGE.MAX_SIZE;

      // Validate file size
      if (input.fileSize > limit) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `File size exceeds ${isVideo ? "5GB" : "10MB"} limit`,
        });
      }

      // Generate unique S3 key (using same helper for now, maybe rename helper later)
      const s3Key = generateVideoS3Key(ctx.session.user.id, input.fileName);

      // Get presigned URL
      const uploadUrl = await getUploadPresignedUrl(s3Key, input.mimeType);

      // Handle thumbnail if present (only for videos)
      let thumbnailUploadUrl: string | undefined;
      let thumbnailS3Key: string | undefined;

      if (isVideo && input.thumbnailType) {
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
   * Confirm upload and create post record
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
        privacy: z
          .enum(["PUBLIC", "UNLISTED", "PRIVATE", "MUTUAL_FOLLOW_FRIENDS"])
          .default("UNLISTED"),
        thumbnailS3Key: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const type = input.mimeType.startsWith("video/") ? "VIDEO" : "IMAGE";

      // For images, the main file is the thumbnail (unless we process it separately)
      // For now, if it's an image, use the signed URL of the main file as thumbnail
      let thumbnailUrl = input.thumbnailS3Key
        ? getS3Url(input.thumbnailS3Key)
        : null;

      if (type === "IMAGE" && !thumbnailUrl) {
        thumbnailUrl = getS3Url(input.s3Key);
      }

      // Create post record
      const post = await ctx.db.post.create({
        data: {
          type,
          s3Key: input.s3Key,
          s3Bucket: input.s3Bucket,
          fileName: input.fileName,
          fileSize: BigInt(input.fileSize),
          mimeType: input.mimeType,
          title: input.title,
          description: input.description ?? null,
          tags: input.tags ?? null,
          privacy: input.privacy,
          thumbnailUrl,
          createdById: ctx.session.user.id,
        },
      });

      return {
        id: post.id,
        title: post.title,
        createdAt: post.createdAt,
      };
    }),

  /**
   * Get all user's posts
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      where: {
        createdById: ctx.session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        type: true,
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

    // Process posts to sign S3 thumbnail URLs
    const processedPosts = await Promise.all(
      posts.map(async (p) => {
        let thumbnailUrl = p.thumbnailUrl;

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
          ...p,
          thumbnailUrl,
          fileSize: p.fileSize?.toString() ?? "0",
        };
      }),
    );

    return processedPosts;
  }),

  /**
   * Get single post details
   */
  get: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({
        where: { id: input.id },
        include: {
          publishJobs: {
            include: {
              platformConnection: true,
            },
          },
        },
      });

      if (!post || post.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      let thumbnailUrl = post.thumbnailUrl;

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
        ...post,
        thumbnailUrl,
        fileSize: post.fileSize?.toString() ?? "0",
      };
    }),

  /**
   * Update post metadata
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        title: z.string().min(1).max(100).optional(),
        description: z.string().max(5000).optional(),
        tags: z.string().max(500).optional(),
        privacy: z
          .enum(["PUBLIC", "UNLISTED", "PRIVATE", "MUTUAL_FOLLOW_FRIENDS"])
          .optional(),
        content: z.string().optional(), // For text posts
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Verify ownership
      const post = await ctx.db.post.findUnique({
        where: { id },
        select: { createdById: true },
      });

      if (!post || post.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't own this post",
        });
      }

      // Update post
      const updated = await ctx.db.post.update({
        where: { id },
        data: updateData,
      });

      return {
        ...updated,
        fileSize: updated.fileSize?.toString() ?? "0",
      };
    }),

  /**
   * Delete post
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        deleteFromPlatforms: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get post with publish jobs
      const post = await ctx.db.post.findUnique({
        where: { id: input.id },
        include: {
          publishJobs: {
            where: { status: "COMPLETED" },
            include: { platformConnection: true },
          },
        },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      // Ensure user owns the post
      if (post.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't own this post",
        });
      }

      // Delete from platforms if requested
      if (input.deleteFromPlatforms) {
        for (const job of post.publishJobs) {
          try {
            if (
              job.platform === "YOUTUBE" &&
              job.platformVideoId &&
              job.platformConnection.accessToken
            ) {
              await deleteVideoFromYouTube({
                accessToken: job.platformConnection.accessToken,
                refreshToken: job.platformConnection.refreshToken,
                videoId: job.platformVideoId,
              });
            }
            // TikTok doesn't support deletion via API easily
          } catch (error) {
            console.error(`Failed to delete from ${job.platform}:`, error);
            // Continue anyway to delete local record
          }
        }
      }

      // Delete from S3 (if applicable)
      if (post.s3Key) {
        try {
          await deleteFromS3(post.s3Key);
        } catch (error) {
          console.error("Failed to delete from S3:", error);
          // Continue with DB deletion even if S3 fails
        }
      }

      // Delete from database (cascade deletes publish jobs)
      await ctx.db.post.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Trigger publish job for post
   */
  publish: protectedProcedure
    .input(
      z.object({
        postId: z.string().cuid(),
        platformConnectionId: z.string().cuid(),
        title: z.string().min(1).max(100).optional(),
        description: z.string().max(5000).optional(),
        tags: z.string().max(500).optional(),
        privacy: z
          .enum(["PUBLIC", "UNLISTED", "PRIVATE", "MUTUAL_FOLLOW_FRIENDS"])
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user owns the post
      const post = await ctx.db.post.findUnique({
        where: { id: input.postId },
        select: { createdById: true },
      });

      if (!post || post.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't own this post",
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

      // Check if post has already been published to this platform
      const existingJob = await ctx.db.publishJob.findFirst({
        where: {
          postId: input.postId,
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
          postId: input.postId,
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
        await inngest.send({
          name: "video/publish.tiktok",
          data: { jobId: job.id },
        });
      } else if (platformConnection.platform === "VIMEO") {
        await inngest.send({
          name: "video/publish.vimeo",
          data: { jobId: job.id },
        });
      }

      return {
        jobId: job.id,
        status: job.status,
        isUpdate,
      };
    }),

  /**
   * Publish to multiple platforms
   */
  publishMulti: protectedProcedure
    .input(
      z.object({
        postId: z.string().cuid(),
        platforms: z.array(z.enum(["YOUTUBE", "TIKTOK", "VIMEO"])),
        scheduledPublishAt: z.date().optional(),
        metadata: z.record(
          z.object({
            title: z.string().optional(),
            description: z.string().optional(),
            tags: z.string().optional(),
            privacy: z
              .enum(["PUBLIC", "UNLISTED", "PRIVATE", "MUTUAL_FOLLOW_FRIENDS"])
              .optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const jobIds: string[] = [];

      // Verify user owns the post
      const post = await ctx.db.post.findUnique({
        where: { id: input.postId },
        select: { createdById: true },
      });

      if (!post || post.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't own this post",
        });
      }

      // Create job for each platform
      for (const platform of input.platforms) {
        // Get platform connection
        const connection = await ctx.db.platformConnection.findUnique({
          where: {
            userId_platform: {
              userId: ctx.session.user.id,
              platform,
            },
          },
        });

        if (!connection) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `${platform} not connected`,
          });
        }

        // Get platform specific metadata
        const meta = input.metadata[platform] ?? {};

        // Create job
        const job = await ctx.db.publishJob.create({
          data: {
            platform,
            status: input.scheduledPublishAt ? "SCHEDULED" : "PENDING",
            scheduledFor: input.scheduledPublishAt,
            postId: input.postId,
            platformConnectionId: connection.id,
            createdById: ctx.session.user.id,
            title: meta.title,
            description: meta.description,
            tags: meta.tags,
            privacy: meta.privacy,
          },
        });

        jobIds.push(job.id);

        // Trigger Inngest
        const eventName =
          platform === "TIKTOK"
            ? "video/publish.tiktok"
            : platform === "VIMEO"
              ? "video/publish.vimeo"
              : "video/publish.youtube";

        await inngest.send({
          name: eventName,
          data: { jobId: job.id },
        });
      }

      return { jobIds };
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
      } else if (job.platform === "VIMEO") {
        await inngest.send({
          name: "video/publish.vimeo",
          data: { jobId: input.jobId },
        });
      }

      return { success: true };
    }),
});
