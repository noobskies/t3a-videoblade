import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { publishToYouTubeFunction } from "@/inngest/publish-to-youtube";
import { updateYouTubeVideoFunction } from "@/inngest/update-youtube-video";
import { publishToTikTokFunction } from "@/inngest/publish-to-tiktok";
import { publishToVimeo } from "@/inngest/publish-to-vimeo";
import { snapshotAnalyticsFunction } from "@/inngest/snapshot-analytics";
import { checkScheduledJobsFunction } from "@/inngest/check-scheduled-jobs";

/**
 * Inngest API endpoint for handling background jobs
 * This endpoint is called by Inngest to execute registered functions
 *
 * Accessible at: /api/inngest
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    publishToYouTubeFunction,
    updateYouTubeVideoFunction,
    publishToTikTokFunction,
    publishToVimeo,
    snapshotAnalyticsFunction,
    checkScheduledJobsFunction,
    // Add more functions here as needed (e.g., Rumble publishing in Phase 2)
  ],
});
