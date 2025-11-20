export const UPLOAD_LIMITS = {
  VIDEO: {
    MAX_SIZE: 5 * 1024 * 1024 * 1024, // 5GB
    ACCEPTED_TYPES: ["video/mp4", "video/quicktime", "video/x-msvideo"], // Basic list, regex used in router
  },
  IMAGE: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ACCEPTED_TYPES: ["image/jpeg", "image/png", "image/webp"],
  },
} as const;
