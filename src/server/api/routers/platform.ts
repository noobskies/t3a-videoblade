import { z } from "zod";
import { createTRPCRouter, organizationProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { getLinkedInProfile } from "@/lib/linkedin";

export const platformRouter = createTRPCRouter({
  /**
   * Get scheduled jobs for a connection (Queue)
   */
  getScheduledJobs: organizationProcedure
    .input(z.object({ connectionId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      // Verify ownership
      const connection = await ctx.db.platformConnection.findUnique({
        where: { id: input.connectionId },
      });

      if (
        !connection ||
        connection.organizationId !== ctx.session.activeOrganizationId
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Platform connection not found or unauthorized",
        });
      }

      // Fetch jobs
      return ctx.db.publishJob.findMany({
        where: {
          platformConnectionId: input.connectionId,
          status: { in: ["PENDING", "SCHEDULED", "PROCESSING"] },
        },
        include: {
          post: {
            select: {
              id: true,
              title: true,
              thumbnailUrl: true,
              type: true,
            },
          },
        },
        orderBy: [
          { scheduledFor: "asc" }, // Scheduled ones first (by date)
          { createdAt: "asc" }, // Then unscheduled pending ones
        ],
      });
    }),

  /**
   * Get user's connected platforms
   */
  list: organizationProcedure.query(async ({ ctx }) => {
    const connections = await ctx.db.platformConnection.findMany({
      where: {
        organizationId: ctx.session.activeOrganizationId,
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
  connectYouTube: organizationProcedure.mutation(async ({ ctx }) => {
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
        organizationId_platform: {
          organizationId: ctx.session.activeOrganizationId,
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
        organizationId: ctx.session.activeOrganizationId,
      },
    });

    return { id: connection.id, platform: "YOUTUBE" as const, new: true };
  }),

  /**
   * Create platform connection from TikTok account
   */
  connectTikTok: organizationProcedure.mutation(async ({ ctx }) => {
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
        organizationId_platform: {
          organizationId: ctx.session.activeOrganizationId,
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
        organizationId: ctx.session.activeOrganizationId,
      },
    });

    return { id: connection.id, platform: "TIKTOK" as const, new: true };
  }),

  /**
   * Create platform connection from Vimeo account
   */
  connectVimeo: organizationProcedure.mutation(async ({ ctx }) => {
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
        organizationId_platform: {
          organizationId: ctx.session.activeOrganizationId,
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
        organizationId: ctx.session.activeOrganizationId,
      },
    });

    return { id: connection.id, platform: "VIMEO" as const, new: true };
  }),

  /**
   * Create platform connection from LinkedIn account
   */
  connectLinkedIn: organizationProcedure.mutation(async ({ ctx }) => {
    // Get user's LinkedIn account from Better Auth
    const linkedinAccount = await ctx.db.account.findFirst({
      where: {
        userId: ctx.session.user.id,
        providerId: "linkedin",
      },
    });

    if (!linkedinAccount) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message:
          "LinkedIn account not connected. Please link your LinkedIn account.",
      });
    }

    if (!linkedinAccount.accessToken) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "No access token found. Please reconnect your LinkedIn account.",
      });
    }

    // Fetch LinkedIn profile to get username
    let platformUsername = "LinkedIn User";
    try {
      const profile = await getLinkedInProfile(linkedinAccount.accessToken);
      platformUsername = profile.name;
    } catch (error) {
      console.error("Failed to fetch LinkedIn profile name:", error);
      // Fallback to session user name if available, or keep default
      if (ctx.session.user.name) platformUsername = ctx.session.user.name;
    }

    // Check if already connected
    const existing = await ctx.db.platformConnection.findUnique({
      where: {
        organizationId_platform: {
          organizationId: ctx.session.activeOrganizationId,
          platform: "LINKEDIN",
        },
      },
    });

    if (existing) {
      // Update existing connection
      const updated = await ctx.db.platformConnection.update({
        where: { id: existing.id },
        data: {
          accessToken: linkedinAccount.accessToken,
          refreshToken: linkedinAccount.refreshToken ?? null,
          tokenExpiry: linkedinAccount.accessTokenExpiresAt ?? null,
          isActive: true,
          platformUsername, // Update username on reconnect
        },
      });

      return { id: updated.id, platform: "LINKEDIN" as const, new: false };
    }

    // Create new connection
    const connection = await ctx.db.platformConnection.create({
      data: {
        platform: "LINKEDIN",
        platformUserId: linkedinAccount.accountId, // LinkedIn user ID
        platformUsername,
        accessToken: linkedinAccount.accessToken,
        refreshToken: linkedinAccount.refreshToken ?? null,
        tokenExpiry: linkedinAccount.accessTokenExpiresAt ?? null,
        organizationId: ctx.session.activeOrganizationId,
      },
    });

    return { id: connection.id, platform: "LINKEDIN" as const, new: true };
  }),

  /**
   * Disconnect platform
   */
  disconnect: organizationProcedure
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

      if (connection.organizationId !== ctx.session.activeOrganizationId) {
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
