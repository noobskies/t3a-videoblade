import { postRouter } from "@/server/api/routers/post";
import { videoRouter } from "@/server/api/routers/video";
import { platformRouter } from "@/server/api/routers/platform";
import { analyticsRouter } from "@/server/api/routers/analytics";
import { calendarRouter } from "@/server/api/routers/calendar";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  video: videoRouter,
  platform: platformRouter,
  analytics: analyticsRouter,
  calendar: calendarRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
