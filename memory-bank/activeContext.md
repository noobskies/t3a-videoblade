# Active Context: t3a-videoblade

## Current Focus

**UI/UX Refactoring & Phase 3 Planning**

We have completed Phase 2 and recently refactored the application layout to be more app-like.

- **Refactor: Full Width Layout**: Switched to a responsive `AppShell` with sidebar navigation.
- **Status**: Layout refactor complete. Ready for Phase 3 planning.

## Recent Changes

- **Refactor: App Layout (2025-11-20)**
  - Created `src/app/_components/layout/app-shell.tsx`: A responsive wrapper with Drawer navigation (Desktop permanent, Mobile temporary).
  - Updated `RootLayout` to use `AppShell` and removed the restrictive global `Container`.
  - **Layout Strategy**: Removed global padding (`p: 0` in `AppShell`) to allow full-width designs (like Dashboard).
  - **Page Constraints**: Updated `Upload`, `Platforms`, `Publish`, `Edit` pages to use `Container maxWidth="md/lg"` with internal padding (`py: 3`).
  - **Library Page**: Updated to use `Container maxWidth={false}` (full width) with internal padding (`py: 3`) for a dashboard grid feel.

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

- **Layout Strategy**: We moved away from a simple top-bar website layout to a persistent sidebar dashboard layout. This required removing global constraints from `layout.tsx` and pushing layout responsibility (max-width, padding) down to individual pages.
- **Padding Management**: To avoid "floating box" looks on full-screen pages (like the gradient home page), the `AppShell` provides zero padding. Content pages apply their own standard padding (`py: 3`) via `Container`.
- **Privacy Mapping**: TikTok's "Friends" privacy setting is mapped to a new `MUTUAL_FOLLOW_FRIENDS` enum value in `VideoPrivacy`. This required a schema migration (via `db push` for dev speed).
- **Multi-Platform Publishing**: We iterate through selected platforms in the backend and create separate `PublishJob` records for each, triggering their respective Inngest events. This allows for independent status tracking and retries.

## Next Steps

1.  **Phase 3 Planning**
    - Review roadmap for Phase 3 (if defined) or identify next major feature set (e.g., Analytics, more platforms, etc.).
    - Consider: Vimeo integration, Batch Uploads, Analytics Dashboard.

## Current Context

- **Project**: VideoBlade (Multi-Platform Video Publisher)
- **Phase**: Transition to Phase 3
- **Status**: Layout Refactor Complete.
- **Current Task**: Memory Bank Update.
