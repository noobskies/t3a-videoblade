# 📡 VideoBlade API Documentation

## Overview

VideoBlade uses tRPC for type-safe API communication between the client and server. All API procedures are organized into routers based on functionality.

## Authentication

All protected procedures require user authentication via NextAuth.js. Users must be signed in to access video management, scheduling, and platform integration features.

## API Routers

### 🎬 Video Router (`video`)

#### Procedures

**`video.getAll`**

- **Type**: Query
- **Auth**: Protected
- **Description**: Get paginated list of user's videos
- **Input**:
  ```typescript
  {
    limit?: number;
    cursor?: string;
    search?: string;
    status?: VideoStatus;
    sortBy?: 'createdAt' | 'title' | 'duration' | 'fileSize';
    sortOrder?: 'asc' | 'desc';
  }
  ```
- **Output**: Paginated video list with metadata

**`video.getById`**

- **Type**: Query
- **Auth**: Protected
- **Description**: Get single video by ID
- **Input**: `{ id: string }`
- **Output**: Video with full metadata

**`video.create`**

- **Type**: Mutation
- **Auth**: Protected
- **Description**: Create new video record after upload
- **Input**: Video creation data
- **Output**: Created video record

**`video.update`**

- **Type**: Mutation
- **Auth**: Protected
- **Description**: Update video metadata
- **Input**: Video update data
- **Output**: Updated video record

**`video.delete`**

- **Type**: Mutation
- **Auth**: Protected
- **Description**: Delete video and cleanup files
- **Input**: `{ id: string }`
- **Output**: Success confirmation

**`video.bulkDelete`**

- **Type**: Mutation
- **Auth**: Protected
- **Description**: Delete multiple videos
- **Input**: `{ ids: string[] }`
- **Output**: Deletion results

### 📺 YouTube Router (`youtube`)

#### Procedures

**`youtube.connectChannel`**

- **Type**: Mutation
- **Auth**: Protected
- **Description**: Connect YouTube channel via OAuth
- **Input**: OAuth authorization data
- **Output**: Connected channel info

**`youtube.disconnectChannel`**

- **Type**: Mutation
- **Auth**: Protected
- **Description**: Disconnect YouTube channel
- **Input**: `{ channelId: string }`
- **Output**: Success confirmation

**`youtube.getChannels`**

- **Type**: Query
- **Auth**: Protected
- **Description**: Get user's connected YouTube channels
- **Input**: None
- **Output**: List of connected channels

**`youtube.uploadVideo`**

- **Type**: Mutation
- **Auth**: Protected
- **Description**: Upload video to YouTube
- **Input**: Video upload data and metadata
- **Output**: YouTube video ID and status

**`youtube.syncMetadata`**

- **Type**: Mutation
- **Auth**: Protected
- **Description**: Sync video metadata with YouTube
- **Input**: `{ videoId: string; youtubeVideoId: string }`
- **Output**: Sync status

### 📅 Scheduling Router (`scheduling`)

#### Procedures

**`scheduling.create`**

- **Type**: Mutation
- **Auth**: Protected
- **Description**: Create scheduled post
- **Input**: Scheduled post data
- **Output**: Created scheduled post

**`scheduling.update`**

- **Type**: Mutation
- **Auth**: Protected
- **Description**: Update scheduled post
- **Input**: Updated scheduled post data
- **Output**: Updated scheduled post

**`scheduling.delete`**

- **Type**: Mutation
- **Auth**: Protected
- **Description**: Cancel scheduled post
- **Input**: `{ id: string }`
- **Output**: Success confirmation

**`scheduling.getUpcoming`**

- **Type**: Query
- **Auth**: Protected
- **Description**: Get upcoming scheduled posts
- **Input**: Date range and filters
- **Output**: List of scheduled posts

**`scheduling.bulkSchedule`**

- **Type**: Mutation
- **Auth**: Protected
- **Description**: Schedule multiple posts
- **Input**: Array of scheduled post data
- **Output**: Scheduling results

### 👤 User Router (`user`)

#### Procedures

**`user.getProfile`**

- **Type**: Query
- **Auth**: Protected
- **Description**: Get user profile information
- **Input**: None
- **Output**: User profile data

**`user.updateProfile`**

- **Type**: Mutation
- **Auth**: Protected
- **Description**: Update user profile
- **Input**: Profile update data
- **Output**: Updated profile

**`user.getUsage`**

- **Type**: Query
- **Auth**: Protected
- **Description**: Get user's current usage statistics
- **Input**: None
- **Output**: Usage data by category

**`user.getSubscription`**

- **Type**: Query
- **Auth**: Protected
- **Description**: Get user's subscription information
- **Input**: None
- **Output**: Subscription details and limits

### 🔗 Channel Router (`channel`)

#### Procedures

**`channel.getAll`**

- **Type**: Query
- **Auth**: Protected
- **Description**: Get all connected channels
- **Input**: None
- **Output**: List of connected channels across platforms

**`channel.connect`**

- **Type**: Mutation
- **Auth**: Protected
- **Description**: Connect new platform channel
- **Input**: Platform and OAuth data
- **Output**: Connected channel info

**`channel.disconnect`**

- **Type**: Mutation
- **Auth**: Protected
- **Description**: Disconnect platform channel
- **Input**: `{ channelId: string }`
- **Output**: Success confirmation

**`channel.refreshToken`**

- **Type**: Mutation
- **Auth**: Protected
- **Description**: Refresh OAuth token for channel
- **Input**: `{ channelId: string }`
- **Output**: Token refresh status

## API Routes (REST)

### File Upload

**`POST /api/upload`**

- **Auth**: Required
- **Description**: Upload video file
- **Content-Type**: `multipart/form-data`
- **Body**: Video file and metadata
- **Response**: Upload progress and file URL

### Webhooks

**`POST /api/webhooks/youtube`**

- **Auth**: YouTube webhook signature
- **Description**: Handle YouTube notifications
- **Body**: YouTube webhook payload
- **Response**: Processing acknowledgment

**`POST /api/webhooks/stripe`**

- **Auth**: Stripe webhook signature
- **Description**: Handle Stripe payment events
- **Body**: Stripe webhook payload
- **Response**: Processing acknowledgment

## Error Handling

### Error Codes

- `UNAUTHORIZED` - User not authenticated
- `FORBIDDEN` - User lacks permission
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid input data
- `QUOTA_EXCEEDED` - API rate limit exceeded
- `SUBSCRIPTION_REQUIRED` - Feature requires subscription
- `USAGE_LIMIT_EXCEEDED` - User exceeded usage limits
- `PLATFORM_ERROR` - External platform API error
- `UPLOAD_FAILED` - File upload error
- `PROCESSING_FAILED` - Video processing error

### Error Response Format

```typescript
{
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
```

## Rate Limiting

- **General API**: 100 requests per minute per user
- **Upload endpoints**: 10 requests per minute per user
- **Platform APIs**: Varies by platform (YouTube: 10,000 units/day)

## Data Validation

All API inputs are validated using Zod schemas. Common validation rules:

- **Video files**: Max 10GB, supported formats (MP4, AVI, MOV, etc.)
- **Titles**: 1-100 characters
- **Descriptions**: Max 5000 characters
- **Tags**: Max 50 tags, 30 characters each
- **Scheduled dates**: Must be in the future

## Pagination

List endpoints support cursor-based pagination:

```typescript
{
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
}
```

## Real-time Updates

- **Upload progress**: WebSocket connection for real-time progress
- **Processing status**: Server-sent events for video processing updates
- **Scheduling notifications**: WebSocket for scheduling confirmations

## Platform-Specific Considerations

### YouTube API

- **Quota**: 10,000 units per day
- **Upload limit**: 128GB per video
- **Rate limiting**: 100 requests per 100 seconds

### TikTok API (Future)

- **Upload limit**: 4GB per video
- **Duration limit**: 10 minutes
- **Rate limiting**: TBD

### Instagram API (Future)

- **Upload limit**: 4GB per video
- **Duration limit**: 60 minutes
- **Rate limiting**: 200 requests per hour

## Testing

### Development Environment

- Base URL: `http://localhost:3000/api`
- Test credentials available in development
- Mock external API responses

### Production Environment

- Base URL: `https://videoblade.com/api`
- Real API credentials required
- Full external API integration

## SDK Usage Examples

### TypeScript Client

```typescript
import { api } from "@/trpc/react";

// Get videos
const { data: videos } = api.video.getAll.useQuery({
  limit: 20,
  sortBy: "createdAt",
  sortOrder: "desc",
});

// Upload video
const uploadMutation = api.video.create.useMutation();

// Schedule post
const scheduleMutation = api.scheduling.create.useMutation({
  onSuccess: (data) => {
    console.log("Post scheduled:", data);
  },
});
```

### Server-side Usage

```typescript
import { api } from "@/trpc/server";

// In server component or API route
const videos = await api.video.getAll({
  limit: 10,
});
```

---

**Last Updated**: December 27, 2024
**API Version**: v1.0.0
