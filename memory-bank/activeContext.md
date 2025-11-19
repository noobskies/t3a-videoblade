# Active Context: t3a-videoblade

## Current Focus

**Phase 2: Multi-Platform Integration (TikTok)**

We have started Phase 2 implementation.

- **Step 1: TikTok OAuth**: Completed.
- **Next Step**: Step 2: TikTok Publisher.

## Recent Changes

- **Feature: TikTok OAuth** (2025-11-19)
  - Added `TIKTOK` to `Platform` enum in Prisma schema.
  - Configured `better-auth` with TikTok provider using `TIKTOK_CLIENT_KEY` and `TIKTOK_CLIENT_SECRET`.
  - Added `connectTikTok` mutation to `platformRouter`.
  - Updated `src/app/platforms/page.tsx` with TikTok connection card.
  - Added environment variable validation for TikTok credentials.

- **Feature: Retry Logic** (2025-11-19)
  - Added `retryPublish` mutation.
  - Updated UI to show retry button for failed jobs.

- **Feature: Video Thumbnails** (2025-11-19)
  - Client-side thumbnail generation during upload.
  - Thumbnails visible immediately in Library/Edit.

- **Homepage Update** (2025-11-19)
  - Modern MUI layout for homepage.

## Active Decisions

- **TikTok Auth Flow**: We use Better Auth's `signIn.social` to link the TikTok account. The `connectTikTok` mutation then syncs the tokens to our `PlatformConnection` table.
- **MUI Icons**: Used `MusicNote` as placeholder for TikTok icon since `@mui/icons-material` doesn't have a dedicated TikTok icon.

## Next Steps

1.  **Implement TikTok Publisher** (Phase 2 - Step 2)
    - Create `src/lib/tiktok.ts` (API wrapper).
    - Create `src/inngest/publish-to-tiktok.ts`.
    - Update `publish-video` logic to handle `TIKTOK` platform.

## Current Context

- **Project**: VideoBlade (Multi-Platform Video Publisher)
- **Phase**: Phase 2 (Multi-Platform - TikTok)
- **Status**: Phase 2 Step 1 Complete.
- **Current Task**: Proceeding to Step 2 (TikTok Publisher).
