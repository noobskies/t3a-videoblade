# Phase 4 Step 1: Multi-Format Infrastructure

## Overview

Transform the backend and data model from being "Video-centric" to "Content-centric" to support Images and Text posts, which are essential for a Buffer-like experience.

## Goals

1.  **Unified Data Model**: Rename `Video` to `Post` and add `MediaType` support.
2.  **Backend Support**: Update API routers and upload logic to handle images.
3.  **Frontend Updates**: Update UI to allow uploading and displaying images alongside videos.

## Implementation Details

### 1. Database Schema Refactor

**Changes**:

- Renamed `Video` model to `Post`.
- Added `enum MediaType { VIDEO, IMAGE, TEXT }`.
- Added `type MediaType` field to `Post` (default: VIDEO).
- Added `content String?` field to `Post` (for text posts).
- Made S3-related fields optional (for Text posts).
- Updated relationships in `User`, `PublishJob`, `PlatformConnection`.

**Migration Strategy**:

- **Reset Strategy**: Due to the prototype nature of Phase 1-3, we opted for a clean break (`prisma migrate reset`) to ensure a robust schema without complex migration scripts for renaming tables. This aligns with "Code Quality First".

### 2. Backend Logic

- **Router**: `src/server/api/routers/video.ts` was refactored into `src/server/api/routers/post.ts`.
- **Upload Logic**: `getUploadUrl` now supports `image/*` MIME types.
- **Inngest Functions**: Updated all background jobs (`publish-to-youtube`, etc.) to use `db.post`.

### 3. Frontend Updates

- **Upload Component**: `BatchVideoUpload` -> `BatchMediaUpload`.
  - Added drag-and-drop support for images.
  - Image preview logic (no need for canvas capture).
- **Card Component**: `VideoCard` -> `PostCard`.
  - Displays appropriate icon (Play for video, Photo for image).
- **Pages**: Updated Library, Publish, and Edit pages to use new components and API.

## Outcome

- **Success**: Users can now upload Images and Videos.
- **Status**: Complete.
- **Next**: Visual Calendar.
