import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import type { DashboardStats, TrendDataPoint } from "@/lib/types/analytics";
import dayjs from "dayjs";
import type { Platform } from "../../../../generated/prisma";

export const analyticsRouter = createTRPCRouter({
  /**
   * Get aggregated stats for the dashboard
   * (Total Views, Likes, etc. from the LATEST snapshot of each job)
   */
  getDashboardStats: protectedProcedure.query(
    async ({ ctx }): Promise<DashboardStats> => {
      // 1. Get all publish jobs for this user
      const jobs = await ctx.db.publishJob.findMany({
        where: {
          createdById: ctx.session.user.id,
          status: "COMPLETED",
          platformVideoId: { not: null },
        },
        select: {
          id: true,
          platform: true,
          // Fetch the latest snapshot for each job
          metricSnapshots: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      let totalViews = 0;
      let totalLikes = 0;
      let totalComments = 0;
      let totalShares = 0;
      const platformBreakdown = {
        youtube: 0,
        tiktok: 0,
        vimeo: 0,
        linkedin: 0,
      };

      for (const job of jobs) {
        if (job.metricSnapshots[0]) {
          const views = job.metricSnapshots[0].views;
          totalViews += views;
          totalLikes += job.metricSnapshots[0].likes;
          totalComments += job.metricSnapshots[0].comments;
          totalShares += job.metricSnapshots[0].shares;

          if (job.platform === "YOUTUBE") platformBreakdown.youtube += views;
          if (job.platform === "TIKTOK") platformBreakdown.tiktok += views;
          if (job.platform === "VIMEO") platformBreakdown.vimeo += views;
          if (job.platform === "LINKEDIN") platformBreakdown.linkedin += views;
        }
      }

      // Calculate growth (simplified: compare to 0 for now, or implement proper comparison later)
      // For a "full featured" app, we should fetch snapshots from 30 days ago to compare.
      // But for MVP of analytics, 0% growth if no history is acceptable, or simple calculation.
      const viewsGrowth = 0;

      return {
        totalViews,
        totalLikes,
        totalComments,
        totalShares,
        totalVideos: jobs.length,
        viewsGrowth,
        platformBreakdown,
      };
    },
  ),

  /**
   * Get trend data for charts
   * Aggregates views by day for the last 30 days
   */
  getTrends: protectedProcedure.query(
    async ({ ctx }): Promise<TrendDataPoint[]> => {
      const endDate = dayjs().endOf("day").toDate();
      const startDate = dayjs().subtract(30, "days").startOf("day").toDate();

      // Fetch all snapshots created in the last 30 days for user's jobs
      const snapshots = await ctx.db.metricSnapshot.findMany({
        where: {
          publishJob: {
            createdById: ctx.session.user.id,
          },
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          publishJob: {
            select: { platform: true },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      // Map/Reduce to group by Date (YYYY-MM-DD)
      const dailyMap = new Map<
        string,
        {
          views: number;
          youtube: number;
          tiktok: number;
          vimeo: number;
          linkedin: number;
        }
      >();

      // Initialize map with 0s for all days
      for (let i = 0; i <= 30; i++) {
        const dateStr = dayjs()
          .subtract(30 - i, "days")
          .format("YYYY-MM-DD");
        dailyMap.set(dateStr, {
          views: 0,
          youtube: 0,
          tiktok: 0,
          vimeo: 0,
          linkedin: 0,
        });
      }

      // Aggregate
      // Note: A "Snapshot" is a point in time. If we have multiple snapshots per day (e.g. debug runs),
      // we should take the MAX or LATEST for that day/job combination.
      // To simplify, we can sum up the *latest* snapshot of the day for each job.
      // Or simpler: Just sum all? No, that would double count.
      // Correct approach: For each day, find the snapshot for each job closest to end of day, then sum.
      // This is complex in basic Prisma.
      // Alternative: Group snapshots by day and publishJobId, pick max, then sum.

      // In-memory aggregation:
      // We define the shape of the snapshot with publishJob for type safety
      type SnapshotWithJob = (typeof snapshots)[0];

      const processedData = new Map<string, Map<string, SnapshotWithJob>>(); // Date -> JobID -> Snapshot

      for (const snap of snapshots) {
        const dateStr = dayjs(snap.createdAt).format("YYYY-MM-DD");
        if (!dailyMap.has(dateStr)) continue; // Out of range (shouldn't happen due to query)

        if (!processedData.has(dateStr)) {
          processedData.set(dateStr, new Map());
        }

        const dayJobs = processedData.get(dateStr)!;
        const existing = dayJobs.get(snap.publishJobId);

        // Keep the latest snapshot for this job on this day
        if (
          !existing ||
          new Date(snap.createdAt) > new Date(existing.createdAt)
        ) {
          dayJobs.set(snap.publishJobId, snap);
        }
      }

      // Now sum up the daily totals from processedData
      for (const [dateStr, jobMap] of processedData) {
        let dailyTotal = 0;
        let dailyYoutube = 0;
        let dailyTiktok = 0;
        let dailyVimeo = 0;
        let dailyLinkedin = 0;

        for (const snap of jobMap.values()) {
          dailyTotal += snap.views;
          if (snap.publishJob.platform === "YOUTUBE")
            dailyYoutube += snap.views;
          if (snap.publishJob.platform === "TIKTOK") dailyTiktok += snap.views;
          if (snap.publishJob.platform === "VIMEO") dailyVimeo += snap.views;
          if (snap.publishJob.platform === "LINKEDIN")
            dailyLinkedin += snap.views;
        }

        dailyMap.set(dateStr, {
          views: dailyTotal,
          youtube: dailyYoutube,
          tiktok: dailyTiktok,
          vimeo: dailyVimeo,
          linkedin: dailyLinkedin,
        });
      }

      // Convert to array
      return Array.from(dailyMap.entries()).map(([date, stats]) => ({
        date,
        ...stats,
      }));
    },
  ),
});
