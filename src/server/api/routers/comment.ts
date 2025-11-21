import { z } from "zod";
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
});
