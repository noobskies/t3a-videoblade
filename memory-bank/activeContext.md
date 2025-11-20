# Active Context: t3a-videoblade

## Current Focus

**Phase 4: Core Buffer Experience**
We have successfully completed **Phase 4, Step 1: Multi-Format Infrastructure**. The application now supports both Videos and Images (and foundation for Text) as generic `Post` entities.

## Recent Changes

- **Multi-Format Pivot**:
  - **Database Refactor**: Renamed `Video` model to `Post`. Added `MediaType` enum (VIDEO, IMAGE, TEXT).
  - **Backend Update**: Rewrote `videoRouter` as `postRouter`. Updated all Inngest functions to use `db.post`.
  - **Frontend Update**: Renamed `BatchVideoUpload` to `BatchMediaUpload` (supports images). Renamed `VideoCard` to `PostCard`.
  - **Cleanup**: Removed `src/server/api/routers/video.ts` and updated all references.

- **Strategic Pivot**: Updated core documentation (`projectbrief.md`, `productContext.md`) to reflect the shift from "Video Tool" to "Comprehensive Media Manager".
- **Roadmap Restructuring**: Defined Phase 4 (Buffer Core) and Phase 5 (Expansion).
- **Production Hardening**: Sentry and Rate Limiting implemented.

## Active Decisions

- **Codebase Terminology**: We have shifted from `Video` to `Post` as the primary entity name in the codebase to reflect the multi-format nature.
- **Breaking Changes**: We opted for a clean break (resetting DB migrations) to ensure a robust `Post` schema rather than maintaining backward compatibility for the prototype `Video` model.
- **Web-Only**: We are prioritizing the web application over a mobile app for now.
- **Buffer Features**: Prioritizing **Visual Calendar** and **Queue System** as the core differentiators for Phase 4.

## Next Steps

1.  **Phase 4, Step 2: Visual Calendar**
    - Install calendar library (`react-big-calendar`).
    - Build the calendar view to display Posts by `scheduledFor` date.
    - Enable drag-and-drop rescheduling.

2.  **Phase 4, Step 3: Queue System**
    - Implement "Posting Slots" logic.
    - Build "Add to Queue" functionality.

## Current Project State

- **Phase**: 4 (Buffer Core)
- **Status**: Multi-Format Infrastructure Complete. Ready for Calendar.
