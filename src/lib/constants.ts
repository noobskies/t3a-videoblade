import type { Platform, PlatformConfig } from "@/types";

// Platform configurations
export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  youtube: {
    name: "youtube",
    displayName: "YouTube",
    icon: "youtube",
    color: "#FF0000",
    maxFileSize: 128 * 1024 * 1024 * 1024, // 128GB
    supportedFormats: [
      "video/mp4",
      "video/avi",
      "video/mov",
      "video/wmv",
      "video/flv",
      "video/webm",
      "video/mkv",
    ],
    maxDuration: 12 * 60 * 60, // 12 hours
    features: {
      scheduling: true,
      liveStreaming: true,
      analytics: true,
    },
  },
  tiktok: {
    name: "tiktok",
    displayName: "TikTok",
    icon: "tiktok",
    color: "#000000",
    maxFileSize: 4 * 1024 * 1024 * 1024, // 4GB
    supportedFormats: ["video/mp4", "video/mov", "video/avi"],
    maxDuration: 10 * 60, // 10 minutes
    features: {
      scheduling: true,
      liveStreaming: false,
      analytics: true,
    },
  },
  instagram: {
    name: "instagram",
    displayName: "Instagram",
    icon: "instagram",
    color: "#E4405F",
    maxFileSize: 4 * 1024 * 1024 * 1024, // 4GB
    supportedFormats: ["video/mp4", "video/mov"],
    maxDuration: 60 * 60, // 60 minutes
    features: {
      scheduling: true,
      liveStreaming: true,
      analytics: true,
    },
  },
  facebook: {
    name: "facebook",
    displayName: "Facebook",
    icon: "facebook",
    color: "#1877F2",
    maxFileSize: 10 * 1024 * 1024 * 1024, // 10GB
    supportedFormats: [
      "video/mp4",
      "video/avi",
      "video/mov",
      "video/wmv",
      "video/flv",
      "video/webm",
    ],
    maxDuration: 4 * 60 * 60, // 4 hours
    features: {
      scheduling: true,
      liveStreaming: true,
      analytics: true,
    },
  },
  twitter: {
    name: "twitter",
    displayName: "Twitter/X",
    icon: "twitter",
    color: "#1DA1F2",
    maxFileSize: 512 * 1024 * 1024, // 512MB
    supportedFormats: ["video/mp4", "video/mov"],
    maxDuration: 2 * 60 + 20, // 2 minutes 20 seconds
    features: {
      scheduling: true,
      liveStreaming: true,
      analytics: true,
    },
  },
};

// Subscription tier limits
export const SUBSCRIPTION_LIMITS = {
  free: {
    videosPerMonth: 5,
    storageLimit: 1024 * 1024 * 1024, // 1GB
    scheduledPosts: 10,
    platforms: 1,
    features: {
      videoEditing: false,
      analytics: false,
      liveStreaming: false,
      teamCollaboration: false,
    },
  },
  pro: {
    videosPerMonth: 50,
    storageLimit: 50 * 1024 * 1024 * 1024, // 50GB
    scheduledPosts: 100,
    platforms: 5,
    features: {
      videoEditing: true,
      analytics: true,
      liveStreaming: false,
      teamCollaboration: false,
    },
  },
  premium: {
    videosPerMonth: -1, // unlimited
    storageLimit: 500 * 1024 * 1024 * 1024, // 500GB
    scheduledPosts: -1, // unlimited
    platforms: 5,
    features: {
      videoEditing: true,
      analytics: true,
      liveStreaming: true,
      teamCollaboration: true,
    },
  },
} as const;

// Video processing constants
export const VIDEO_PROCESSING = {
  SUPPORTED_FORMATS: [
    "video/mp4",
    "video/avi",
    "video/mov",
    "video/wmv",
    "video/flv",
    "video/webm",
    "video/mkv",
    "video/m4v",
  ],
  MAX_UPLOAD_SIZE: 10 * 1024 * 1024 * 1024, // 10GB default
  THUMBNAIL_SIZES: {
    small: { width: 320, height: 180 },
    medium: { width: 640, height: 360 },
    large: { width: 1280, height: 720 },
  },
  SUPPORTED_SUBTITLE_FORMATS: ["srt", "vtt", "ass"],
} as const;

// API endpoints
export const API_ENDPOINTS = {
  VIDEOS: "/api/videos",
  UPLOAD: "/api/upload",
  YOUTUBE: "/api/youtube",
  SCHEDULING: "/api/scheduling",
  ANALYTICS: "/api/analytics",
  CHANNELS: "/api/channels",
  WEBHOOKS: "/api/webhooks",
} as const;

// Error codes
export const ERROR_CODES = {
  // Authentication errors
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",

  // Upload errors
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  UNSUPPORTED_FORMAT: "UNSUPPORTED_FORMAT",
  UPLOAD_FAILED: "UPLOAD_FAILED",

  // Processing errors
  PROCESSING_FAILED: "PROCESSING_FAILED",
  INVALID_VIDEO: "INVALID_VIDEO",

  // Platform errors
  PLATFORM_ERROR: "PLATFORM_ERROR",
  QUOTA_EXCEEDED: "QUOTA_EXCEEDED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",

  // Subscription errors
  SUBSCRIPTION_REQUIRED: "SUBSCRIPTION_REQUIRED",
  USAGE_LIMIT_EXCEEDED: "USAGE_LIMIT_EXCEEDED",

  // General errors
  INTERNAL_ERROR: "INTERNAL_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
} as const;

// Default values
export const DEFAULTS = {
  TIMEZONE: "UTC",
  VIDEO_TITLE: "Untitled Video",
  RETRY_ATTEMPTS: 3,
  PAGINATION_LIMIT: 20,
  UPLOAD_CHUNK_SIZE: 1024 * 1024, // 1MB
} as const;

// Date/time formats
export const DATE_FORMATS = {
  DISPLAY: "MMM dd, yyyy",
  DISPLAY_WITH_TIME: "MMM dd, yyyy 'at' h:mm a",
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  TIME_ONLY: "h:mm a",
} as const;

// Storage keys for localStorage/sessionStorage
export const STORAGE_KEYS = {
  USER_PREFERENCES: "videoblade_user_preferences",
  UPLOAD_PROGRESS: "videoblade_upload_progress",
  DRAFT_POSTS: "videoblade_draft_posts",
} as const;
