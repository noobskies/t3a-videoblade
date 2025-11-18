import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { publishToYouTubeFunction } from "@/inngest/publish-to-youtube";
import { updateYouTubeVideoFunction } from "@/inngest/update-youtube-video";

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
    // Add more functions here as needed (e.g., Rumble publishing in Phase 2)
  ],
});
