import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

const scheduleSlotSchema = z.object({
  day: z.number().min(0).max(6), // 0=Sunday, 6=Saturday
  times: z.array(z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)), // "HH:MM"
});

export const scheduleRouter = createTRPCRouter({
  getSettings: protectedProcedure
    .input(z.object({ platformConnectionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const connection = await ctx.db.platformConnection.findUnique({
        where: { id: input.platformConnectionId },
        include: { postingSchedule: true },
      });

      if (!connection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Platform connection not found",
        });
      }

      if (connection.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this connection",
        });
      }

      return connection.postingSchedule;
    }),

  updateSettings: protectedProcedure
    .input(
      z.object({
        platformConnectionId: z.string(),
        timezone: z.string(),
        slots: z.array(scheduleSlotSchema),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const connection = await ctx.db.platformConnection.findUnique({
        where: { id: input.platformConnectionId },
      });

      if (!connection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Platform connection not found",
        });
      }

      if (connection.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this connection",
        });
      }

      // Upsert the schedule
      return ctx.db.postingSchedule.upsert({
        where: { platformConnectionId: input.platformConnectionId },
        create: {
          platformConnectionId: input.platformConnectionId,
          timezone: input.timezone,
          slots: input.slots,
        },
        update: {
          timezone: input.timezone,
          slots: input.slots,
        },
      });
    }),
});
