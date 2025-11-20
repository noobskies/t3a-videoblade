# Phase 3 Step 3: Batch Operations

## Overview

Currently, VideoBlade supports uploading one video at a time. To support power users, we need to implement batch operations, allowing users to upload, edit, and publish multiple videos simultaneously.

## Requirements

### 1. Batch Upload UI

- **Multi-File Selection**: Support drag-and-drop for multiple files.
- **Queue Management**:
  - View list of pending uploads.
  - Remove items from queue.
  - See status of each item (Pending, Uploading, Success, Error).
- **Bulk Edit**:
  - Edit title/description for each video in the list.
  - (Future) Apply same settings to all videos.

### 2. Technical Implementation

- **State Management**:
  - Replace single `file` state with `UploadQueueItem[]`.
  - Manage upload progress for each item independently.
- **Upload Logic**:
  - Sequential or concurrent uploads (limit concurrency to ~3).
  - Reuse existing `getUploadUrl` and `confirmUpload` TRPC procedures.
- **Error Handling**:
  - If one upload fails, others should continue.
  - Retry mechanism for failed uploads.

## Implementation Plan

1.  **Create `BatchVideoUpload` Component**:
    - New component in `src/app/_components/batch-video-upload.tsx`.
    - Will eventually replace `VideoUpload`.

2.  **Refactor Upload Page**:
    - Update `src/app/upload/page.tsx` to use the new component.

3.  **Refine UX**:
    - Add "Clear Completed" button.
    - Add "Upload All" button.

## Data Structures

```typescript
interface UploadQueueItem {
  id: string; // UUID
  file: File;
  title: string;
  description: string;
  thumbnailBlob?: Blob;
  status: "idle" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
  previewUrl?: string;
}
```
