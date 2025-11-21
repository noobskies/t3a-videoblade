# Active Context: t3a-videoblade

## Current Focus

**Phase 4: Core Buffer Experience**
We have successfully completed **Phase 4, Step 3: Queue System**. The application now supports defining posting schedules and "Add to Queue" functionality.

## Recent Changes

- **API Layer Multi-Format Support**:
  - **Refactoring**: Renamed `createVideoSchema` to `createPostSchema` in validators.
  - **Backend**: Updated `postRouter.create` (formerly `confirmUpload`) to support creating Text, Video, and Image posts.
  - **Frontend**: Updated `BatchMediaUpload` to use the renamed API mutation.

- **Queue System Implementation**:
  - **Schema**: Added `PostingSchedule` model linked to `PlatformConnection`.
  - **Backend**: Created `scheduleRouter` and `QueueService` for schedule management and slot calculation.
  - **UI**: Created Schedule Settings page (`/platforms/[id]/schedule`) and integrated "Smart Queue" into the Publish workflow.
  - **Scheduling Logic**: Updated `checkScheduledJobs` to support `SCHEDULED` status jobs.

- **Visual Calendar Implementation (Previous Step)**:
  - **Frontend**: Built with `react-big-calendar` and `react-dnd`.
  - **Backend**: Updated `calendarRouter`.

## Active Decisions

- **Smart Queue Logic**:
  - Uses a "First Available Slot" algorithm.
  - Looks ahead 60 days for open slots.
  - Assigns `SCHEDULED` status with a calculated `scheduledFor` timestamp.
  - Relies on `check-scheduled-jobs` cron to pick up jobs when their time comes.

- **Terminology**: "Post" is now the ubiquitous term for content items. "Video" is only used when referring specifically to video media type or platform constraints.

## Next Steps

1.  **Phase 4, Step 4: Ideas/Drafts**
    - Create a space for content ideas that aren't yet scheduled or fully formed.
    - Allow "Quick Draft" creation without media.

2.  **Phase 5: Platform Expansion**
    - Begin adding LinkedIn integration.

## Current Project State

- **Phase**: 4 (Buffer Core)
- **Status**: Queue System Complete. Ready for Ideas/Drafts.
