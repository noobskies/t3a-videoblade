import { inngest } from "@/lib/inngest";
import { db } from "@/server/db";

/**
 * Cron job to check for pending scheduled jobs and trigger them.
 * Runs every 5 minutes.
 */
export const checkScheduledJobsFunction = inngest.createFunction(
  {
    id: "check-scheduled-jobs",
    name: "Check Scheduled Publish Jobs",
  },
  { cron: "*/5 * * * *" },
  async ({ step }) => {
    // 1. Find jobs scheduled for now or the past that are still PENDING
    const jobsToTrigger = await step.run("find-pending-jobs", async () => {
      return await db.publishJob.findMany({
        where: {
          status: { in: ["PENDING", "SCHEDULED"] },
          scheduledFor: {
            lte: new Date(),
          },
        },
        take: 50, // Process in batches to avoid timeouts
      });
    });

    if (jobsToTrigger.length === 0) {
      return { message: "No pending scheduled jobs found." };
    }

    // 2. Trigger publish events for each job
    const events = jobsToTrigger
      .map((job) => {
        let eventName = "";
        switch (job.platform) {
          case "YOUTUBE":
            eventName = "video/publish.youtube";
            break;
          case "TIKTOK":
            eventName = "video/publish.tiktok";
            break;
          case "VIMEO":
            eventName = "video/publish.vimeo";
            break;
          case "LINKEDIN":
            eventName = "video/publish.linkedin";
            break;
          default:
            console.warn(`Unknown platform: ${job.platform}`);
            return null;
        }

        if (!eventName) return null;

        return {
          name: eventName,
          data: {
            jobId: job.id,
          },
        };
      })
      .filter(
        (e): e is { name: string; data: { jobId: string } } => e !== null,
      );

    if (events.length > 0) {
      await step.run("trigger-publish-events", async () => {
        await inngest.send(events);
        return { triggeredCount: events.length };
      });
    }

    return {
      processed: jobsToTrigger.length,
      triggered: events.length,
    };
  },
);
