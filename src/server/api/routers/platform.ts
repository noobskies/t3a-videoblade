import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const platformRouter = createTRPCRouter({
  /**
   * Get user's connected platforms
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const connections = await ctx.db.platformConnection.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Don't expose full tokens to client
    return connections.map((conn) => ({
      id: conn.id,
      platform: conn.platform,
      platformUsername: conn.platformUsername,
      isActive: conn.isActive,
      createdAt: conn.createdAt,
    }));
  }),

  /**
   * Create platform connection from OAuth account
   */
  connectYouTube: protectedProcedure.mutation(async ({ ctx }) => {
    // Get user's Google account from Better Auth
    const googleAccount = await ctx.db.account.findFirst({
      where: {
        userId: ctx.session.user.id,
        providerId: "google", // Better Auth uses providerId
      },
    });

    if (!googleAccount) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Google account not connected. Please sign in with Google.",
      });
    }

    if (!googleAccount.accessToken) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No access token found. Please reconnect your Google account.",
      });
    }

    // Check if already connected
    const existing = await ctx.db.platformConnection.findUnique({
      where: {
        userId_platform: {
          userId: ctx.session.user.id,
          platform: "YOUTUBE",
        },
      },
    });

    if (existing) {
      // Update existing connection
      const updated = await ctx.db.platformConnection.update({
        where: { id: existing.id },
        data: {
          accessToken: googleAccount.accessToken,
          refreshToken: googleAccount.refreshToken ?? null,
          tokenExpiry: googleAccount.accessTokenExpiresAt ?? null, // Better Auth field name
          isActive: true,
        },
      });

      return { id: updated.id, platform: "YOUTUBE" as const, new: false };
    }

    // Create new connection
    const connection = await ctx.db.platformConnection.create({
      data: {
        platform: "YOUTUBE",
        platformUserId: googleAccount.accountId, // Google user ID
        platformUsername: ctx.session.user.name ?? "Unknown",
        accessToken: googleAccount.accessToken,
        refreshToken: googleAccount.refreshToken ?? null,
        tokenExpiry: googleAccount.accessTokenExpiresAt ?? null, // Better Auth field name
        userId: ctx.session.user.id,
      },
    });

    return { id: connection.id, platform: "YOUTUBE" as const, new: true };
  }),

  /**
   * Disconnect platform
   */
  disconnect: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const connection = await ctx.db.platformConnection.findUnique({
        where: { id: input.id },
      });

      if (!connection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Connection not found",
        });
      }

      if (connection.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not your connection",
        });
      }

      await ctx.db.platformConnection.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
