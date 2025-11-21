import { inngest } from "@/lib/inngest";
import { db } from "@/server/db";
import { SyncService } from "@/server/lib/comments/sync-service";

export const syncComments = inngest.createFunction(
  { id: "sync-comments" },
  [
    { cron: "*/15 * * * *" }, // Every 15 minutes
    { event: "comments/sync.requested" }, // Manual trigger
  ],
  async ({ event, step }) => {
    // 1. Fetch active connections
    const connections = await step.run("fetch-connections", async () => {
      const allConnections = await db.platformConnection.findMany({
        where: { isActive: true },
        select: { id: true, platform: true },
      });
      return allConnections;
    });

    if (connections.length === 0) {
      return { message: "No active connections found" };
    }

    // 2. Sync each connection
    // We limit concurrency or just loop through them.
    // For Inngest, separate steps for each might be too many steps if we have many users.
    // Better: Trigger a separate function for each connection?
    // Or just process them in groups.
    // Let's loop for now.

    const results = await step.run("sync-all-connections", async () => {
      const service = new SyncService();
      const results = [];

      for (const conn of connections) {
        try {
          await service.syncCommentsForConnection(conn.id);
          results.push({ id: conn.id, status: "success" });
        } catch (e) {
          console.error(`Failed to sync connection ${conn.id}`, e);
          results.push({ id: conn.id, status: "error", error: String(e) });
        }
      }
      return results;
    });

    return { processed: results.length, results };
  },
);
