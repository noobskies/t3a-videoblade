# Active Context

## Current Focus: Channel-Centric UI Polish (Phase 6.5)

We have focused heavily on refining the channel-specific experience (`/platforms/[id]`). This ensures that each channel operates as a distinct workspace with its own Overview, Inbox, Queue, and Settings.

### Recent Changes (2025-11-21)

1.  **Channel-Centric Architecture**
    - **Sidebar**: Dynamically lists connected channels.
    - **Channel Routing**: `/platforms/[id]` structure with tabs for Overview, Inbox, Schedule, and Settings.

2.  **Channel Features Implementation**
    - **Overview**: Enhanced with real-time stats (Views, Likes, etc.) and an "Up Next" card showing the next scheduled post.
    - **Inbox**: Channel-specific filtered view of comments.
    - **Schedule (Queue)**: Renamed tab purpose to "Content Queue". Now shows a list of upcoming posts (Pending/Scheduled) instead of configuration.
    - **Settings**: Created a new Settings tab.
      - Moved "Posting Schedule" (slots configuration) here.
      - Added "Disconnect Channel" functionality.
      - Shows connection details.

3.  **Backend Updates**
    - **TRPC**: Added `platform.getScheduledJobs` and `analytics.getPlatformStats` to support the new UI.

4.  **Cleanup**
    - Deleted `MUI_MIGRATION_PLAN.md` as migration is complete.

## Active Decisions

- **Separation of Concerns**: "Schedule" tab is for _viewing_ the queue (what's happening), while "Settings" is for _configuring_ the rules (when it happens).
- **Unified State**: The application treats all platforms consistently in the UI.

## Next Steps

1.  **Resume Phase 5**: X (Twitter) integration is the next logical platform expansion step when ready.
2.  **Phase 3 Features**: Team features and API access are on the horizon.
