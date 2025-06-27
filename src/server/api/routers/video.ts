import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { Prisma } from "@prisma/client";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

// Input validation schemas
const videoCreateSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be under 100 characters"),
  description: z
    .string()
    .max(5000, "Description must be under 5000 characters")
    .optional(),
  fileName: z.string().min(1, "File name is required"),
  originalName: z.string().min(1, "Original name is required"),
  fileUrl: z.string().url("Invalid file URL"),
  thumbnailUrl: z.string().url("Invalid thumbnail URL").optional(),
  duration: z.number().int().positive().optional(),
  fileSize: z.bigint().positive("File size must be positive"),
  mimeType: z.string().min(1, "MIME type is required"),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  fps: z.number().positive().optional(),
  bitrate: z.number().int().positive().optional(),
  tags: z
    .array(z.string().max(30, "Tag must be under 30 characters"))
    .max(50, "Maximum 50 tags allowed")
    .default([]),
  metadata: z.record(z.unknown()).optional(),
});

const videoUpdateSchema = z.object({
  id: z.string().cuid("Invalid video ID"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be under 100 characters")
    .optional(),
  description: z
    .string()
    .max(5000, "Description must be under 5000 characters")
    .optional(),
  tags: z
    .array(z.string().max(30, "Tag must be under 30 characters"))
    .max(50, "Maximum 50 tags allowed")
    .optional(),
  thumbnailUrl: z.string().url("Invalid thumbnail URL").optional(),
});

const videoListSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().cuid().optional(),
  search: z.string().optional(),
  status: z
    .enum(["uploading", "processing", "ready", "error", "deleted"])
    .optional(),
  sortBy: z
    .enum(["createdAt", "title", "duration", "fileSize"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const videoDeleteSchema = z.object({
  id: z.string().cuid("Invalid video ID"),
});

const videoBulkDeleteSchema = z.object({
  ids: z
    .array(z.string().cuid("Invalid video ID"))
    .min(1, "At least one video ID required")
    .max(50, "Maximum 50 videos at once"),
});

export const videoRouter = createTRPCRouter({
  // Get paginated list of user's videos
  getAll: protectedProcedure
    .input(videoListSchema)
    .query(async ({ ctx, input }) => {
      const { limit, cursor, search, status, sortBy, sortOrder } = input;

      // Build where clause
      const where: Prisma.VideoWhereInput = {
        userId: ctx.session.user.id,
        status: { not: "deleted" }, // Exclude soft-deleted videos
      };

      if (status) {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { tags: { hasSome: [search] } },
        ];
      }

      // Build orderBy clause
      const orderBy: Prisma.VideoOrderByWithRelationInput = {};
      if (sortBy === "createdAt") {
        orderBy.createdAt = sortOrder;
      } else if (sortBy === "title") {
        orderBy.title = sortOrder;
      } else if (sortBy === "duration") {
        orderBy.duration = sortOrder;
      } else if (sortBy === "fileSize") {
        orderBy.fileSize = sortOrder;
      }

      try {
        const videos = await ctx.db.video.findMany({
          where,
          orderBy,
          take: limit + 1, // Take one extra to determine if there are more
          cursor: cursor ? { id: cursor } : undefined,
          select: {
            id: true,
            title: true,
            description: true,
            fileName: true,
            originalName: true,
            fileUrl: true,
            thumbnailUrl: true,
            duration: true,
            fileSize: true,
            mimeType: true,
            width: true,
            height: true,
            fps: true,
            bitrate: true,
            status: true,
            processingProgress: true,
            errorMessage: true,
            tags: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        let nextCursor: string | undefined = undefined;
        if (videos.length > limit) {
          const nextItem = videos.pop(); // Remove the extra item
          nextCursor = nextItem!.id;
        }

        return {
          videos,
          nextCursor,
          hasMore: !!nextCursor,
        };
      } catch (error) {
        console.error("Error fetching videos:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch videos",
        });
      }
    }),

  // Get single video by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().cuid("Invalid video ID") }))
    .query(async ({ ctx, input }) => {
      try {
        const video = await ctx.db.video.findFirst({
          where: {
            id: input.id,
            userId: ctx.session.user.id,
            status: { not: "deleted" },
          },
          include: {
            scheduledPosts: {
              select: {
                id: true,
                title: true,
                scheduledFor: true,
                status: true,
                channel: {
                  select: {
                    name: true,
                    platform: true,
                  },
                },
              },
            },
            clips: {
              select: {
                id: true,
                name: true,
                startTime: true,
                endTime: true,
                duration: true,
                status: true,
              },
            },
          },
        });

        if (!video) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Video not found",
          });
        }

        return video;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error fetching video:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch video",
        });
      }
    }),

  // Create new video record
  create: protectedProcedure
    .input(videoCreateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check user's video upload limits based on subscription tier
        const user = await ctx.db.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { subscriptionTier: true },
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Get current month's video count
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const videoCount = await ctx.db.video.count({
          where: {
            userId: ctx.session.user.id,
            createdAt: { gte: startOfMonth },
            status: { not: "deleted" },
          },
        });

        // Check limits based on subscription tier
        const limits = {
          free: 5,
          pro: 50,
          premium: Infinity,
        };

        const userTier =
          (user.subscriptionTier as keyof typeof limits) || "free";
        const limit = limits[userTier];

        if (videoCount >= limit) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `Video upload limit reached for ${userTier} tier. Upgrade your subscription to upload more videos.`,
          });
        }

        // Create video record
        const { metadata, ...videoData } = input;
        const video = await ctx.db.video.create({
          data: {
            ...videoData,
            userId: ctx.session.user.id,
            status: "processing", // Start in processing state
            metadata: metadata as Prisma.InputJsonValue,
          },
        });

        // Update user's usage tracking
        await ctx.db.usageLimit.upsert({
          where: {
            userId_limitType: {
              userId: ctx.session.user.id,
              limitType: "videos_uploaded",
            },
          },
          update: {
            currentUsage: { increment: 1 },
          },
          create: {
            userId: ctx.session.user.id,
            limitType: "videos_uploaded",
            currentUsage: 1,
            limitValue: limit === Infinity ? 999999 : limit,
            resetDate: new Date(
              startOfMonth.getFullYear(),
              startOfMonth.getMonth() + 1,
              1,
            ),
          },
        });

        return video;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error creating video:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create video",
        });
      }
    }),

  // Update video metadata
  update: protectedProcedure
    .input(videoUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      try {
        // Verify ownership
        const existingVideo = await ctx.db.video.findFirst({
          where: {
            id,
            userId: ctx.session.user.id,
            status: { not: "deleted" },
          },
        });

        if (!existingVideo) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Video not found",
          });
        }

        // Update video
        const updatedVideo = await ctx.db.video.update({
          where: { id },
          data: {
            ...updateData,
            updatedAt: new Date(),
          },
        });

        return updatedVideo;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error updating video:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update video",
        });
      }
    }),

  // Delete single video (soft delete)
  delete: protectedProcedure
    .input(videoDeleteSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify ownership
        const video = await ctx.db.video.findFirst({
          where: {
            id: input.id,
            userId: ctx.session.user.id,
            status: { not: "deleted" },
          },
          include: {
            scheduledPosts: {
              where: {
                status: { in: ["scheduled", "publishing"] },
              },
            },
          },
        });

        if (!video) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Video not found",
          });
        }

        // Check for active scheduled posts
        if (video.scheduledPosts.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message:
              "Cannot delete video with active scheduled posts. Cancel scheduled posts first.",
          });
        }

        // Soft delete the video
        await ctx.db.video.update({
          where: { id: input.id },
          data: {
            status: "deleted",
            updatedAt: new Date(),
          },
        });

        return { success: true, message: "Video deleted successfully" };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error deleting video:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete video",
        });
      }
    }),

  // Bulk delete videos
  bulkDelete: protectedProcedure
    .input(videoBulkDeleteSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify ownership and check for scheduled posts
        const videos = await ctx.db.video.findMany({
          where: {
            id: { in: input.ids },
            userId: ctx.session.user.id,
            status: { not: "deleted" },
          },
          include: {
            scheduledPosts: {
              where: {
                status: { in: ["scheduled", "publishing"] },
              },
            },
          },
        });

        if (videos.length !== input.ids.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Some videos not found or already deleted",
          });
        }

        // Check for videos with active scheduled posts
        const videosWithScheduledPosts = videos.filter(
          (v) => v.scheduledPosts.length > 0,
        );
        if (videosWithScheduledPosts.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Cannot delete ${videosWithScheduledPosts.length} video(s) with active scheduled posts. Cancel scheduled posts first.`,
          });
        }

        // Bulk soft delete
        const result = await ctx.db.video.updateMany({
          where: {
            id: { in: input.ids },
            userId: ctx.session.user.id,
          },
          data: {
            status: "deleted",
            updatedAt: new Date(),
          },
        });

        return {
          success: true,
          deletedCount: result.count,
          message: `${result.count} video(s) deleted successfully`,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error bulk deleting videos:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete videos",
        });
      }
    }),

  // Get user's video statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.session.user.id;

      // Get current month date range
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [totalVideos, monthlyVideos, totalStorage, videosByStatus] =
        await Promise.all([
          // Total videos (excluding deleted)
          ctx.db.video.count({
            where: {
              userId,
              status: { not: "deleted" },
            },
          }),

          // Videos uploaded this month
          ctx.db.video.count({
            where: {
              userId,
              status: { not: "deleted" },
              createdAt: { gte: startOfMonth },
            },
          }),

          // Total storage used
          ctx.db.video.aggregate({
            where: {
              userId,
              status: { not: "deleted" },
            },
            _sum: {
              fileSize: true,
            },
          }),

          // Videos by status
          ctx.db.video.groupBy({
            by: ["status"],
            where: {
              userId,
              status: { not: "deleted" },
            },
            _count: {
              status: true,
            },
          }),
        ]);

      return {
        totalVideos,
        monthlyVideos,
        totalStorage: totalStorage._sum.fileSize || BigInt(0),
        videosByStatus: videosByStatus.reduce(
          (acc, item) => {
            acc[item.status] = item._count.status;
            return acc;
          },
          {} as Record<string, number>,
        ),
      };
    } catch (error) {
      console.error("Error fetching video stats:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch video statistics",
      });
    }
  }),
});
