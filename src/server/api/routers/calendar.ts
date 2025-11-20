import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { updateVideoOnYouTube } from "@/lib/youtube";
import { updateVideoOnVimeo } from "@/lib/vimeo";

export const calendarRouter = createTRPCRouter({
  /**
   * Get calendar events (publish jobs) within a date range
   */
  getEvents: protectedProcedure
    .input(
      z.object({
        start: z.date(),
        end: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const jobs = await ctx.db.publishJob.findMany({
        where: {
          createdById: ctx.session.user.id,
          OR: [
            // Scenario 1: Scheduled jobs (any status)
            {
              scheduledFor: {
                gte: input.start,
                lte: input.end,
              },
            },
            // Scenario 2: Completed jobs (use completedAt or createdAt)
            {
              status: "COMPLETED",
              completedAt: {
                gte: input.start,
                lte: input.end,
              },
            },
            // Fallback for completed jobs without completedAt (shouldn't happen often but safe)
            {
              status: "COMPLETED",
              completedAt: null,
              createdAt: {
                gte: input.start,
                lte: input.end,
              },
            },
          ],
        },
        include: {
          post: {
            select: {
              title: true,
              thumbnailUrl: true,
            },
          },
        },
      });

      return jobs.map((job) => {
        // Determine the effective date for the calendar
        const start = job.scheduledFor ?? job.completedAt ?? job.createdAt;

        // Visual styling based on status
        let color = "#3788d8"; // Default blue
        switch (job.status) {
          case "COMPLETED":
            color = "#28a745"; // Green
            break;
          case "FAILED":
            color = "#dc3545"; // Red
            break;
          case "PLATFORM_SCHEDULED":
            color = "#17a2b8"; // Cyan/Teal (Native)
            break;
          case "PENDING":
          case "SCHEDULED":
            color = "#ffc107"; // Yellow/Orange (Internal Pending)
            break;
        }

        return {
          id: job.id,
          title: `${job.platform}: ${job.post.title}`,
          start,
          end: new Date(start.getTime() + 1000 * 60 * 30), // Default 30 min duration for visualization
          allDay: false,
          resource: {
            status: job.status,
            platform: job.platform,
            thumbnailUrl: job.post.thumbnailUrl,
          },
          color, // For frontend styling
        };
      });
    }),

  /**
   * Reschedule a job
   */
  rescheduleEvent: protectedProcedure
    .input(
      z.object({
        jobId: z.string().cuid(),
        newDate: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const job = await ctx.db.publishJob.findUnique({
        where: { id: input.jobId },
        include: { platformConnection: true },
      });

      if (!job || job.createdById !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      // Validation
      if (
        job.status === "COMPLETED" ||
        job.status === "PROCESSING" ||
        job.status === "FAILED"
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot reschedule completed, processing, or failed jobs",
        });
      }

      if (input.newDate < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot reschedule to the past",
        });
      }

      // Handle Native Rescheduling
      if (job.status === "PLATFORM_SCHEDULED") {
        if (!job.platformVideoId) {
          // Should not happen for PLATFORM_SCHEDULED, but safe check
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Missing platform video ID for native rescheduling",
          });
        }

        try {
          if (job.platform === "YOUTUBE") {
            await updateVideoOnYouTube({
              accessToken: job.platformConnection.accessToken,
              refreshToken: job.platformConnection.refreshToken,
              videoId: job.platformVideoId,
              title: job.title ?? "Untitled", // Required params
              privacy: "private", // Maintain private status
              scheduledPublishAt: input.newDate,
            });
          } else if (job.platform === "VIMEO") {
            await updateVideoOnVimeo({
              accessToken: job.platformConnection.accessToken,
              videoId: job.platformVideoId,
              scheduledPublishAt: input.newDate,
            });
          } else {
            // Fallback for others if they mistakenly get this status
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Native rescheduling not supported for this platform",
            });
          }
        } catch (error) {
          console.error("Native rescheduling failed:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to reschedule on ${job.platform}: ${error instanceof Error ? error.message : "Unknown error"}`,
          });
        }
      }

      // Update DB (for both Internal and Native)
      const updatedJob = await ctx.db.publishJob.update({
        where: { id: input.jobId },
        data: {
          scheduledFor: input.newDate,
        },
      });

      return updatedJob;
    }),
});
