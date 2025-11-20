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
   * Create platform connection from TikTok account
   */
  connectTikTok: protectedProcedure.mutation(async ({ ctx }) => {
    // Get user's TikTok account from Better Auth
    const tiktokAccount = await ctx.db.account.findFirst({
      where: {
        userId: ctx.session.user.id,
        providerId: "tiktok",
      },
    });

    if (!tiktokAccount) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message:
          "TikTok account not connected. Please link your TikTok account.",
      });
    }

    if (!tiktokAccount.accessToken) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No access token found. Please reconnect your TikTok account.",
      });
    }

    // Check if already connected
    const existing = await ctx.db.platformConnection.findUnique({
      where: {
        userId_platform: {
          userId: ctx.session.user.id,
          platform: "TIKTOK",
        },
      },
    });

    if (existing) {
      // Update existing connection
      const updated = await ctx.db.platformConnection.update({
        where: { id: existing.id },
        data: {
          accessToken: tiktokAccount.accessToken,
          refreshToken: tiktokAccount.refreshToken ?? null,
          tokenExpiry: tiktokAccount.accessTokenExpiresAt ?? null,
          isActive: true,
        },
      });

      return { id: updated.id, platform: "TIKTOK" as const, new: false };
    }

    // Create new connection
    const connection = await ctx.db.platformConnection.create({
      data: {
        platform: "TIKTOK",
        platformUserId: tiktokAccount.accountId, // TikTok user ID
        platformUsername: "TikTok User", // TikTok API doesn't always give username in basic info, update later if possible
        accessToken: tiktokAccount.accessToken,
        refreshToken: tiktokAccount.refreshToken ?? null,
        tokenExpiry: tiktokAccount.accessTokenExpiresAt ?? null,
        userId: ctx.session.user.id,
      },
    });

    return { id: connection.id, platform: "TIKTOK" as const, new: true };
  }),

  /**
   * Create platform connection from Vimeo account
   */
  connectVimeo: protectedProcedure.mutation(async ({ ctx }) => {
    // Get user's Vimeo account from Better Auth
    const vimeoAccount = await ctx.db.account.findFirst({
      where: {
        userId: ctx.session.user.id,
        providerId: "vimeo",
      },
    });

    if (!vimeoAccount) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Vimeo account not connected. Please link your Vimeo account.",
      });
    }

    if (!vimeoAccount.accessToken) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No access token found. Please reconnect your Vimeo account.",
      });
    }

    // Check if already connected
    const existing = await ctx.db.platformConnection.findUnique({
      where: {
        userId_platform: {
          userId: ctx.session.user.id,
          platform: "VIMEO",
        },
      },
    });

    if (existing) {
      // Update existing connection
      const updated = await ctx.db.platformConnection.update({
        where: { id: existing.id },
        data: {
          accessToken: vimeoAccount.accessToken,
          refreshToken: vimeoAccount.refreshToken ?? null,
          tokenExpiry: vimeoAccount.accessTokenExpiresAt ?? null,
          isActive: true,
        },
      });

      return { id: updated.id, platform: "VIMEO" as const, new: false };
    }

    // Create new connection
    const connection = await ctx.db.platformConnection.create({
      data: {
        platform: "VIMEO",
        platformUserId: vimeoAccount.accountId, // Vimeo user ID (URI)
        platformUsername: "Vimeo User", // Will be updated via analytics/sync later
        accessToken: vimeoAccount.accessToken,
        refreshToken: vimeoAccount.refreshToken ?? null,
        tokenExpiry: vimeoAccount.accessTokenExpiresAt ?? null,
        userId: ctx.session.user.id,
      },
    });

    return { id: connection.id, platform: "VIMEO" as const, new: true };
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
