# Active Context: t3a-videoblade

## Current Focus

**Phase 6: Engagement (Unified Inbox)**
We are building the **Unified Inbox** to aggregate and manage comments from connected platforms. The core foundation and reply functionality are now complete.

## Recent Changes

- **Phase 6 (Engagement)**:
  - **Unified Inbox Foundation**: Database schema, Sync Services, and Inngest jobs implemented.
  - **Reply Functionality**: Users can now reply to YouTube and LinkedIn comments directly from the dashboard.
  - **Optimistic Updates**: Replies are immediately added to the local database for instant feedback.

## Active Decisions

- **Sync-First Architecture for Inbox**: We decided to sync comments to our database rather than fetching them in real-time on page load.
  - **Why**: Enables internal state tracking (Read/Unread/Resolved), faster UI, and local search/filtering.
  - **Trade-off**: Comments might be slightly delayed (cron-based sync), but user experience is better.

## Next Steps

1.  **Unified Inbox Polish**:
    - Add filtering by platform.
    - Add search functionality.
    - Improve "My Reply" visualization (currently just shows as a comment).
2.  **Phase 6 Wrap-up**: Verify all engagement features are stable.

## Current Project State

- **Phase**: 6 (Engagement)
- **Status**: Unified Inbox Implemented (Sync + Reply).
