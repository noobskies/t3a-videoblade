# Active Context: t3a-videoblade

## Current Focus

**Phase 6: Engagement (Unified Inbox)**
With Phase 5 (Platform Expansion) on hold, we are shifting focus to the "Engagement" pillar of the project. We are building the **Unified Inbox** to aggregate and manage comments from connected platforms.

## Recent Changes

- **Phase 5 Paused**:
  - **LinkedIn Integration**: Complete.
  - **X (Twitter)**: On Hold (Cost).
  - **Meta (Facebook/Instagram)**: On Hold (User request).
- **Phase 6 Started**:
  - Defined roadmap for Unified Inbox.
  - Chose "Sync-First" architecture for reliable "Inbox Zero" workflow.

## Active Decisions

- **Sync-First Architecture for Inbox**: We decided to sync comments to our database rather than fetching them in real-time on page load.
  - **Why**: Enables internal state tracking (Read/Unread/Resolved), faster UI, and local search/filtering.
  - **Trade-off**: Comments might be slightly delayed (cron-based sync), but user experience is better.

## Next Steps

1.  **Database Schema**: Add `Comment` and `CommentAuthor` models to Prisma schema.
2.  **Service Layer**: Create `CommentService` interface and platform implementations.
3.  **Sync Logic**: Implement Inngest job to poll platform APIs.
4.  **UI**: Build the `/dashboard/inbox` interface.

## Current Project State

- **Phase**: 6 (Engagement)
- **Status**: Starting Unified Inbox Implementation.
