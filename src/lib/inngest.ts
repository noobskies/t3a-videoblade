import { Inngest } from "inngest";
import { env } from "@/env";

/**
 * Inngest client for VideoBlade
 * Handles background job processing for video publishing
 */
export const inngest = new Inngest({
  id: "videoblade",
  eventKey: env.INNGEST_EVENT_KEY,
});
