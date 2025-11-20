# Active Context: t3a-videoblade

## Current Focus

**Phase 2: Multi-Platform Integration (TikTok)**

We are currently working on Phase 2.

- **Step 1: TikTok OAuth**: Completed.
- **Step 2: TikTok Publisher**: Completed.
- **Step 3: Multi-Platform UI**: Completed.
- **Step 4: Delete Videos**: Completed.
- **Step 5: Scheduling**: Completed.
- **Phase 2 Status**: Complete.

## Recent Changes

- **Feature: Scheduling** (2025-11-19)
  - Added `SCHEDULED` status to `PublishStatus` enum.
  - Updated `PublishPage` with MUI `DateTimePicker` for scheduling.
  - Updated `videoRouter.publishMulti` to handle `scheduledPublishAt`.
  - Updated Inngest workflows (`publish-to-youtube`, `publish-to-tiktok`) to support `step.sleepUntil`.
  - Updated `EditVideoPage` to support `MUTUAL_FOLLOW_FRIENDS`.

- **Feature: Delete Videos** (2025-11-19)
  - Updated `VideoCard` with MUI Dialog for safer deletion confirmation.
  - Added backend support for deleting published videos from platforms (YouTube).
  - Updated `videoRouter.delete` to cascade delete jobs and optionally call platform APIs.
  - Updated `src/lib/youtube.ts` with deletion support.

- **Feature: Multi-Platform UI** (2025-11-19)
  - Implemented `publishMulti` procedure to handle simultaneous publishing.
  - Updated `VideoPrivacy` enum to support `MUTUAL_FOLLOW_FRIENDS` for TikTok.
  - Created new `PublishPage` allowing selection of multiple platforms (YouTube/TikTok).
  - Added platform-specific metadata configuration forms.

- **Feature: TikTok Publisher** (2025-11-19)
  - Created `src/lib/tiktok.ts` for API interaction.
  - Implemented `publishToTikTokFunction` Inngest job.
  - Updated `videoRouter` to dispatch `video/publish.tiktok` events.
  - Refactored types in `src/lib/types/video.ts` and `platform.ts`.

- **Feature: TikTok OAuth** (2025-11-19)
  - Added `TIKTOK` to `Platform` enum in Prisma schema.
  - Configured `better-auth` with TikTok provider.
  - Added `connectTikTok` mutation.

## Active Decisions

- **Privacy Mapping**: TikTok's "Friends" privacy setting is mapped to a new `MUTUAL_FOLLOW_FRIENDS` enum value in `VideoPrivacy`. This required a schema migration (via `db push` for dev speed).
- **Multi-Platform Publishing**: We iterate through selected platforms in the backend and create separate `PublishJob` records for each, triggering their respective Inngest events. This allows for independent status tracking and retries.

## Next Steps

1.  **Phase 3 Planning**
    - Review roadmap for Phase 3 (if defined) or identify next major feature set (e.g., Analytics, more platforms, etc.).

## Current Context

- **Project**: VideoBlade (Multi-Platform Video Publisher)
- **Phase**: Phase 2 (Multi-Platform - TikTok)
- **Status**: Phase 2 Complete.
- **Current Task**: Phase 2 Complete.
