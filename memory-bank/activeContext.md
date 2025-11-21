# Active Context: t3a-videoblade

## Current Focus

**Polish & Hardening**
We have completed a **Polish Sprint** to clean up technical debt, finalize the MUI migration, and refine the Ideas feature.

## Recent Changes

- **Codebase Polish & Cleanup**:
  - **Legacy Removal**: Completely removed Tailwind CSS, PostCSS, and shadcn/radix dependencies.
  - **MUI Migration**: Finalized migration of UI components (`ErrorAlert`, `Skeletons`) to native MUI.
  - **Ideas Polish**: Added proper loading skeletons (`IdeaCardSkeleton`, `IdeaGridSkeleton`) and polished the UI.

- **Ideas & Drafts Implementation**:
  - **Schema**: Modified `Post` model to make `title` optional and added `isIdea` boolean.
  - **Backend**: Updated `createPostSchema` and `postRouter` to support optional titles and idea creation.
  - **Frontend**:
    - Created `/ideas` page with `QuickEntry` and `IdeaCard` components.
    - Updated `PostCard` and `EditPostPage` to handle optional titles.
    - Implemented "Convert to Post" workflow in the edit page.
    - Added "Ideas" to the navigation sidebar.

- **Queue System Implementation (Previous Step)**:
  - **Schema**: Added `PostingSchedule` model linked to `PlatformConnection`.
  - **Backend**: Created `scheduleRouter` and `QueueService`.
  - **UI**: Created Schedule Settings page and integrated "Smart Queue".

## Active Decisions

- **Ideas as Posts**: We decided to use the existing `Post` model for Ideas by adding an `isIdea` flag and making `title` optional. This simplifies the "Convert to Post" workflow (it's just an update operation) and keeps the codebase unified.
- **Optional Titles**: Since Ideas are for quick entry, we allow creating them without a title (using the content as a fallback display). When converting to a Post, a title is required if it's missing.

## Next Steps

1.  **Phase 5: Platform Expansion**
    - Begin adding LinkedIn integration.
    - Support text-only posts on LinkedIn (and X/Twitter later).

## Current Project State

- **Phase**: 4 (Buffer Core) -> Polish
- **Status**: Codebase polished and legacy dependencies removed. Ready for Phase 5.
