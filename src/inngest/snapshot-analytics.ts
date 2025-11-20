import { inngest } from "@/lib/inngest";
import { db } from "@/server/db";
import { getYouTubeVideoStats } from "@/lib/youtube";
import { getTikTokVideoStats } from "@/lib/tiktok";
import { getVimeoVideoStats } from "@/lib/vimeo";

export const snapshotAnalyticsFunction = inngest.createFunction(
  { id: "snapshot-analytics", name: "Snapshot Analytics Daily" },
  { cron: "0 0 * * *" }, // Daily at midnight UTC
  async ({ step }) => {
    // 1. Fetch all active platform connections
    const connections = await step.run("fetch-connections", async () => {
      return await db.platformConnection.findMany({
        where: { isActive: true },
        select: {
          id: true,
          platform: true,
          accessToken: true,
          refreshToken: true,
          userId: true,
        },
      });
    });

    if (connections.length === 0) {
      return { message: "No active connections found" };
    }

    // 2. Process each connection
    const results = [];

    for (const connection of connections) {
      const result = await step.run(
        `process-connection-${connection.id}`,
        async () => {
          try {
            // Fetch completed jobs for this connection
            const jobs = await db.publishJob.findMany({
              where: {
                platformConnectionId: connection.id,
                status: "COMPLETED",
                platformVideoId: { not: null },
              },
              select: {
                id: true,
                platformVideoId: true,
              },
            });

            if (jobs.length === 0) return { processed: 0, skipped: true };

            const videoIds = jobs
              .map((j) => j.platformVideoId)
              .filter((id): id is string => !!id);

            // Fetch stats based on platform
            let stats: Array<{
              videoId: string;
              views: number;
              likes: number;
              comments: number;
              shares: number;
            }> = [];

            if (connection.platform === "YOUTUBE") {
              stats = await getYouTubeVideoStats({
                accessToken: connection.accessToken,
                refreshToken: connection.refreshToken,
                videoIds,
              });
            } else if (connection.platform === "TIKTOK") {
              stats = await getTikTokVideoStats({
                accessToken: connection.accessToken,
                videoIds,
              });
            } else if (connection.platform === "VIMEO") {
              stats = await getVimeoVideoStats({
                accessToken: connection.accessToken,
                videoIds,
              });
            }

            // Save snapshots
            const snapshots = [];
            for (const stat of stats) {
              // Find the job corresponding to this videoId
              // (Note: In theory multiple jobs could point to same platform ID if multiple users?
              // But here we filter by connection ID so it's safe)
              const job = jobs.find((j) => j.platformVideoId === stat.videoId);
              if (job) {
                snapshots.push({
                  publishJobId: job.id,
                  views: stat.views,
                  likes: stat.likes,
                  comments: stat.comments,
                  shares: stat.shares,
                });
              }
            }

            if (snapshots.length > 0) {
              await db.metricSnapshot.createMany({
                data: snapshots,
              });
            }

            return {
              processed: snapshots.length,
              platform: connection.platform,
              userId: connection.userId,
            };
          } catch (error) {
            console.error(
              `Failed to process connection ${connection.id}:`,
              error,
            );
            return {
              error: error instanceof Error ? error.message : "Unknown error",
              platform: connection.platform,
              userId: connection.userId,
            };
          }
        },
      );
      results.push(result);
    }

    return { results };
  },
);
