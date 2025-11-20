# Phase 3 Step 2: Vimeo Integration

## Goal

Enable users to connect their Vimeo account, publish videos directly from VideoBlade (S3) to Vimeo, and track analytics.

## Implementation Plan

### 1. Database & Authentication

- [ ] Update `prisma/schema.prisma`: Add `VIMEO` to `Platform` enum.
- [ ] Run migration: `npm run db:generate` (since we are using Prisma Accelerate in prod, but for dev we use sqlite/postgres. Wait, checking context... `prisma/migrations` exists. I should use `npm run db:generate` for client update and `npm run db:migrate` or `db:push` for schema).
- [ ] Update `src/server/auth.ts`: Configure Vimeo provider in Better Auth.
- [ ] Update `.env.example`: Add `VIMEO_CLIENT_ID` and `VIMEO_CLIENT_SECRET`.

### 2. Vimeo API Library (`src/lib/vimeo.ts`)

- [ ] Implement `uploadVideoToVimeo`:
  - Use Vimeo's "Pull Upload" approach (provide S3 URL to Vimeo).
  - This is more efficient than downloading to server first.
- [ ] Implement `getVimeoVideoStats`: Fetch views, likes, comments.
- [ ] Implement `updateVideoOnVimeo`: Edit title, description, privacy.
- [ ] Implement `deleteVideoFromVimeo`.

### 3. Backend Logic

- [ ] Update `src/server/api/routers/platform.ts`: Add `connectVimeo` mutation.
- [ ] Create `src/inngest/publish-to-vimeo.ts`:
  - Handle background publishing.
  - Poll for upload completion if "pull" upload is async.
- [ ] Register function in `src/app/api/inngest/route.ts`.

### 4. Analytics Integration

- [ ] Update `src/inngest/snapshot-analytics.ts`:
  - Fetch connected Vimeo accounts.
  - Retrieve stats for Vimeo videos.
  - Aggregate into daily snapshot.

### 5. Frontend Updates

- [ ] Update `src/app/platforms/page.tsx`: Add Vimeo connection card.
- [ ] Update `src/app/publish/[id]/page.tsx`:
  - Add Vimeo to platform selector.
  - Add Vimeo-specific privacy options (Vimeo has more granular privacy than YouTube).

## Verification

- [ ] User can connect Vimeo account.
- [ ] User can select Vimeo during publish flow.
- [ ] Video appears on Vimeo after background job completes.
- [ ] Vimeo stats appear in Analytics Dashboard (after 24h or manual trigger).
