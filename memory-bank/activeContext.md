# Active Context: t3a-videoblade

## Current Focus

**Phase 5: Platform Expansion**
We are currently implementing new social platforms to transform VideoBlade into a true multi-channel management tool.

## Recent Changes

- **LinkedIn Integration (Phase 5, Step 1)**:
  - **Media Support**: Implemented full support for **Image** and **Video** uploads to LinkedIn using their modern Assets/Images/Videos APIs.
  - **Backend**: Updated `src/lib/linkedin.ts` to handle upload initialization, binary transfer, and finalization.
  - **Background Jobs**: Updated `publish-to-linkedin` Inngest function to fetch media from S3 and publish it seamlessly.
  - **UI**: Added LinkedIn connection card and auth flow.

- **Codebase Polish & Cleanup**:
  - **Legacy Removal**: Completely removed Tailwind CSS, PostCSS, and shadcn/radix dependencies.
  - **MUI Migration**: Finalized migration of UI components (`ErrorAlert`, `Skeletons`) to native MUI.
  - **Ideas Polish**: Added proper loading skeletons and polished the UI.

- **Ideas & Drafts Implementation**:
  - **Schema**: Modified `Post` model to support optional titles and `isIdea` boolean.
  - **Frontend**: Created `/ideas` page with Quick Entry and "Convert to Post" workflow.

## Active Decisions

- **LinkedIn Media Handling**: We chose to implement the full upload flow (Initialize -> Upload -> Finalize) within our backend service rather than relying on client-side uploads. This ensures consistent behavior across platforms and leverages our existing S3 infrastructure as the source of truth for media files.
- **Ideas as Posts**: We decided to use the existing `Post` model for Ideas by adding an `isIdea` flag. This simplifies the "Convert to Post" workflow.

## Next Steps

1.  **Phase 5: Platform Expansion (Continued)**
    - **Step 2**: X (Twitter) Integration.
    - **Step 3**: Instagram/Facebook Integration.

2.  **Phase 6: Engagement**
    - Unified Inbox implementation.

## Current Project State

- **Phase**: 5 (Platform Expansion)
- **Status**: LinkedIn Integration Complete (Text, Image, Video). Ready for X (Twitter).
