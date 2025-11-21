import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { Platform } from "../../../../generated/prisma";
import { SyncService } from "@/server/lib/comments/sync-service";

export const commentRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().nullish(),
        platform: z.nativeEnum(Platform).optional(),
        isResolved: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, platform, isResolved } = input;

      // Fetch user's platform connections to filter comments
      // We only show comments for connections owned by the user
      const items = await ctx.db.comment.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          platformConnection: {
            userId: ctx.session.user.id,
          },
          platform: platform,
          isResolved: isResolved,
          // Hide hidden comments
          isHidden: false,
        },
        orderBy: {
          publishedAt: "desc",
        },
        include: {
          author: true,
          post: {
            select: { title: true, thumbnailUrl: true },
          },
          platformConnection: {
            select: { platformUsername: true },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  resolve: protectedProcedure
    .input(z.object({ id: z.string(), isResolved: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.comment.update({
        where: {
          id: input.id,
          platformConnection: {
            userId: ctx.session.user.id,
          },
        },
        data: {
          isResolved: input.isResolved,
        },
      });
    }),

  hide: protectedProcedure
    .input(z.object({ id: z.string(), isHidden: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.comment.update({
        where: {
          id: input.id,
          platformConnection: {
            userId: ctx.session.user.id,
          },
        },
        data: {
          isHidden: input.isHidden,
        },
      });
    }),

  sync: protectedProcedure.mutation(async ({ ctx }) => {
    // Trigger sync for all user connections
    const connections = await ctx.db.platformConnection.findMany({
      where: { userId: ctx.session.user.id, isActive: true },
    });

    const service = new SyncService();
    let count = 0;

    // Process in background or await?
    // For better UX, maybe trigger Inngest or await for a few seconds.
    // Let's await for now for immediate feedback, but catch errors.
    // Since this might be slow, we might timeout.
    // Better to use Inngest trigger.

    // For MVP, let's just try to sync sequentially.
    for (const conn of connections) {
      try {
        await service.syncCommentsForConnection(conn.id);
        count++;
      } catch (e) {
        console.error(`Sync failed for ${conn.platform}`, e);
      }
    }

    return { success: true, syncedCount: count };
  }),

  reply: protectedProcedure
    .input(z.object({ commentId: z.string(), content: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // 1. Fetch original comment and its connection
      const comment = await ctx.db.comment.findUnique({
        where: { id: input.commentId },
        include: {
          platformConnection: true,
        },
      });

      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      // Ensure user owns this connection
      if (comment.platformConnection.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You do not own this connection",
        });
      }

      // 2. Get service
      const syncService = new SyncService();
      const service = syncService.getService(comment.platform);

      if (!service) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Reply not supported for this platform",
        });
      }

      // 3. Post reply to external platform
      let newExternalId: string;
      try {
        newExternalId = await service.reply(
          comment.platformConnection.accessToken,
          comment.platformConnection.platformUserId,
          comment.externalId,
          input.content,
        );
      } catch (error) {
        console.error("Reply failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to post reply to platform",
        });
      }

      // 4. Optimistically insert reply into local DB
      // We need to find/create a CommentAuthor for "Me" (the connection user)
      // This is tricky because we don't always have full profile info for "me" in `PlatformConnection`
      // For now, we'll try to use connection metadata if available, or just use a placeholder.
      // Ideally, we should have fetched "Me" profile during connection setup.

      const authorName = comment.platformConnection.platformUsername ?? "Me";

      // Try to find existing author for this connection's user ID
      const meAuthor = await ctx.db.commentAuthor.upsert({
        where: {
          platform_externalId: {
            platform: comment.platform,
            externalId: comment.platformConnection.platformUserId,
          },
        },
        create: {
          platform: comment.platform,
          externalId: comment.platformConnection.platformUserId,
          name: authorName,
        },
        update: {}, // Don't overwrite if exists
      });

      const newComment = await ctx.db.comment.create({
        data: {
          platform: comment.platform,
          externalId: newExternalId,
          content: input.content,
          publishedAt: new Date(), // Now
          platformConnectionId: comment.platformConnectionId,
          authorId: meAuthor.id,
          postId: comment.postId,
          externalPostId: comment.externalPostId,
          parentId: comment.id, // This is a reply to the input comment
          isResolved: true, // My own replies are resolved by default? Or maybe not. Let's leave default (false) or true. True makes sense as "I handled it".
        },
      });

      // Optionally mark the parent comment as resolved since we replied
      // await ctx.db.comment.update({
      //   where: { id: comment.id },
      //   data: { isResolved: true },
      // });

      return newComment;
    }),
});
