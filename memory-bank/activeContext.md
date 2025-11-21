# Active Context

## Current Focus: Channel-Centric UI & Engagement Polish

We are restructuring the application to be more **Channel-Centric**, similar to Buffer. Instead of just a unified inbox/calendar, users can now navigate to specific channels (platform connections) from the sidebar and access features specific to that channel.

### Recent Changes (2025-11-21)

1.  **Channel-Centric Architecture**
    - **Sidebar**: Updated `AppShell` to dynamically list connected channels (YouTube, LinkedIn, etc.) under a "Channels" section.
    - **Channel Routing**: Created `/platforms/[id]` structure for channel-specific views.
    - **Channel Layout**: Added `PlatformLayout` with tabs for Overview, Inbox, Schedule, and Settings.
    - **Channel Overview**: Added a dashboard page for individual channels.
    - **Channel Inbox**: Added a filtered inbox view at `/platforms/[id]/inbox`.

2.  **Unified Inbox Polish**
    - **Pagination**: Refactored `CommentList` to use `useInfiniteQuery` with a "Load More" button.
    - **Visuals**: Improved card styling (cleaner, elevation 0, better avatars).
    - **Filtering**: Added support for filtering by `platformConnectionId` in backend and frontend.

## Active Decisions

- **Navigation**: We are moving towards a hybrid model where "Unified" views (Dashboard, Inbox, Calendar) exist alongside "Channel-Specific" views. This gives users flexibility.
- **MUI Grid**: We seem to be using MUI v6 or Grid v2 (`size` prop instead of `item xs`).
- **Infinite Scroll**: Implemented via "Load More" button for better UX control, rather than auto-scroll.

## Next Steps

1.  **Finish Phase 6 (Engagement)**: The Inbox is now polished and integrated into the channel view.
2.  **Resume Phase 5**: X (Twitter) integration is the next logical platform expansion step when ready.
3.  **Phase 3 Features**: Team features and API access are on the horizon.
