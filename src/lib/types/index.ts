/**
 * Type definitions barrel export
 * Central export point for all application types
 *
 * Usage:
 *   import type { VideoListItem, AsyncData } from '@/lib/types'
 *
 * Or import from specific domain:
 *   import type { VideoListItem } from '@/lib/types/video'
 */

// Post domain types
export type {
  PublishJob,
  PostListItem,
  PostList,
  PostListFromRouter,
} from "./post";

// Common utility types
export type { AsyncData } from "./common";

// Platform domain types
export type {
  PlatformConnection,
  PlatformConnectionList,
  PlatformListFromRouter,
} from "./platform";
export { isPlatformConnectionList } from "./platform";

// Future exports:
// export type { ... } from './publish'
