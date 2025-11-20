# Active Context: t3a-videoblade

## Current Focus

**Phase 3 Planning & Performance Optimization**

We have implemented a comprehensive lazy loading system and are now transitioning to Phase 3.

- **Performance**: Implemented skeleton loading states, route-level suspense, and lazy loading for heavy components.
- **Status**: Loading states verified. Ready for Phase 3 implementation.

## Recent Changes

- **Performance: Lazy Loading & Skeletons (2025-11-20)**
  - **Skeleton System**: Created reusable MUI skeletons in `src/app/_components/ui/skeletons.tsx` (VideoCard, PlatformCard, EditPage, PublishPage).
  - **Route Loading**: Added `loading.tsx` for `/library`, `/platforms`, `/video/[id]/edit`, and `/publish/[id]` to show skeletons instantly on navigation.
  - **Suspense Integration**: Updated Client Components (`LibraryPage`, `PlatformsPage`, etc.) to use `useSuspenseQuery`. This ensures they suspend while fetching data, triggering the route-level `loading.tsx` instead of showing a white screen.
  - **Landing Page Optimization**: Implemented `next/dynamic` for `Features`, `Platforms`, and `Footer` to lazy load below-the-fold content.
  - **AppShell Fix**: Refined `AppShell` loading logic to only show full-screen loader on initial session load, preventing "whole shell" reloads during navigation revalidation.

- **Refactor: Auth & Layouts (2025-11-20)**
  - **Middleware**: Secured routes with middleware.
  - **AppShell**: Implemented responsive sidebar layout with conditional rendering.

## Active Decisions

- **Suspense for Data Fetching**: We standardized on using `useSuspenseQuery` for all Client Components that fetch data. This delegates loading state handling to Next.js `loading.tsx` boundaries, providing a more consistent and native loading experience (no more manual `if (isLoading) return null`).
- **Skeleton Design System**: We use a shared `skeletons.tsx` file for skeleton primitives to ensure consistency across the app. Skeletons must match the exact dimensions of the content they replace to prevent CLS.
- **Auth-Driven Layouts**: Controlled via `AppShell` based on `useSession`. Full-screen loading is restricted to the `undefined` session state (initial load) to preserve the shell during revalidation.

## Next Steps

1.  **Phase 3 Implementation**
    - **Vimeo Integration**: Add 3rd platform.
    - **Analytics Dashboard**: Aggregated views.
    - **Batch Uploads**: Multi-file upload.
    - **Production Hardening**: Sentry, rate limiting.

## Current Context

- **Project**: VideoBlade (Multi-Platform Video Publisher)
- **Phase**: Transition to Phase 3
- **Status**: Performance Optimization Complete.
- **Current Task**: Documentation Update.
