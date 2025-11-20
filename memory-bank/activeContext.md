# Active Context: t3a-videoblade

## Current Focus

**Phase 3 Planning**

We have completed Phase 2 and the UI/Layout refactoring. The application now has a robust layout system that correctly handles authenticated vs. unauthenticated states.

- **Refactor: Auth & Layouts**: Secured routes with middleware and implemented conditional layout rendering.
- **Status**: Layouts verified. Ready for Phase 3 (Expansion & Analytics).

## Recent Changes

- **Refactor: Auth & Layouts (2025-11-20)**
  - **Middleware**: Created `src/middleware.ts` to protect private routes (`/library`, `/upload`, etc.) and redirect unauthenticated users to home.
  - **AppShell Update**: Modified `AppShell` to conditionally render the Sidebar/AppBar based on session state.
    - **Unauthenticated**: Shows "Public Header" (Logo + Sign In) + Full width content.
    - **Authenticated**: Shows "Dashboard Layout" (Sidebar + User Menu) + Content.
    - **Loading**: Shows Skeleton loader to prevent layout shift.
  - **User Menu**: Added Avatar + Sign Out menu in the authenticated AppBar.

- **Refactor: App Layout (2025-11-20)**
  - Created `src/app/_components/layout/app-shell.tsx`: A responsive wrapper with Drawer navigation.
  - Updated `RootLayout` to use `AppShell`.
  - **Layout Strategy**: Removed global padding (`p: 0` in `AppShell`) to allow full-width designs.

- **Feature: Scheduling** (2025-11-19)
  - Added `SCHEDULED` status to `PublishStatus` enum.
  - Updated `PublishPage` with MUI `DateTimePicker` for scheduling.
  - Updated Inngest workflows to support `step.sleepUntil`.

## Active Decisions

- **Auth-Driven Layouts**: We decided to control the entire application layout structure (`AppShell`) based on authentication status on the client side. This ensures a smooth transition from "Landing Page" mode to "Dashboard" mode without full page reloads or layout flickering (mitigated by loading skeletons).
- **Middleware Protection**: While tRPC handles API protection, we added Next.js Middleware to prevent unauthenticated access to protected _pages_, providing a better UX (immediate redirect) than loading a broken page.

## Next Steps

1.  **Phase 3 Planning**
    - **Analytics Dashboard**: Aggregated views, success rates.
    - **Vimeo Integration**: Add 3rd platform.
    - **Batch Uploads**: Multi-file upload.
    - **Production Hardening**: Sentry, rate limiting refinement.

## Current Context

- **Project**: VideoBlade (Multi-Platform Video Publisher)
- **Phase**: Transition to Phase 3
- **Status**: Layouts & Auth Flow Complete.
- **Current Task**: Phase 3 Scoping.
