# Active Context: t3a-videoblade

## Current Work Focus

**Phase**: UI Overhaul - MUI Migration  
**Current Step**: Phase 2 (Core Layout Migration) Complete ✅ → Moving to Phase 3 (Generic UI Components)  
**Product**: VideoBlade - Multi-Platform Video Publishing Tool  
**Status**: Performing complete UI migration from shadcn/Tailwind to Material-UI v6.  
**Last Updated**: 2025-11-19

## Recent Changes

### MUI Migration - Phase 2: Core Layout Complete (2025-11-19)

**Milestone**: ✅ Application Shell Migration

**Accomplishments**:

- **Layout Migration**:
  - Updated `src/app/layout.tsx` to use MUI `AppBar`, `Toolbar`, and `Container`.
  - Replaced Tailwind navigation with MUI components.
  - Replaced generic HTML wrappers with MUI `Box` and `Container`.
- **Style Cleanup**:
  - Removed conflicting `@layer base` styles from `globals.css`.
  - Allowed MUI `CssBaseline` to control global styles.

**Impact**:

- Application shell (Navbar, Footer, Container) is now fully native MUI.
- Layout is responsive and centered using MUI Container.
- Removed reliance on Tailwind base styles.

### MUI Migration - Phase 1: Foundation Complete (2025-11-19)

**Milestone**: ✅ Foundation & Configuration

**Accomplishments**:

- **Dependency Management**:
  - Uninstalled `lucide-react` (removed legacy icons).
  - Installed `@mui/material`, `@mui/material-nextjs`, `@emotion/react`, `@emotion/styled`.
  - Installed `@mui/icons-material` (replaced Lucide).
  - Installed `@fontsource/roboto` and configured `next/font/google`.
- **Theme Configuration**:
  - Created `src/theme.ts` with `cssVariables: true` and native dark mode (`colorSchemes`).
- **Layout Integration**:
  - Updated `src/app/layout.tsx` with `AppRouterCacheProvider` and `ThemeProvider`.
  - Injected `CssBaseline` for consistent styling.
- **Build Fixes**:
  - Migrated icons in 8 files (`video-card.tsx`, `error-alert.tsx`, etc.) from Lucide to Material Icons to ensure build passes.

**Impact**:

- Application now runs with MUI engine enabled.
- Mixed styling state (MUI + Tailwind) temporarily, but functional.
- Build pipeline is green.

### YouTube OAuth Scope Fix (2025-11-18 - 9:10 AM)

**Critical Production Bug Fix**: ✅ OAUTH SCOPE CORRECTED

**Problem Identified**: Production error "Request had insufficient authentication scopes" (403) when updating YouTube video metadata.

**Root Cause**:

- Used `youtube.upload` scope - Only allows uploading **NEW** videos
- Used `youtube.readonly` scope - Read-only access, no modifications
- Smart Publish feature needs to **UPDATE** existing video metadata
- These narrow scopes insufficient for `videos.update` API endpoint

**Solution Applied**:

```typescript
// Before (Insufficient)
"https://www.googleapis.com/auth/youtube.upload";
"https://www.googleapis.com/auth/youtube.readonly";

// After (Fixed)
"https://www.googleapis.com/auth/youtube"; // Full YouTube access
```

**File Modified**:

- ✅ `src/server/auth.ts` - Updated OAuth scope configuration

**Impact**:

- ✅ Fixes 403 errors on video metadata updates
- ✅ Smart Publish feature now works correctly
- ✅ Future-proof for all video operations
- ⚠️ Requires user action (reconnect YouTube)

## Next Steps

### Immediate (MUI Migration Phase 3)

**Goal**: Migrate generic UI components to native MUI.

**Tasks**:

1.  Migrate `AuthButton` (use MUI `Button` + `Avatar` + `Menu`).
2.  Migrate `ErrorAlert` (use MUI `Alert`).
3.  Migrate `LoadingSkeleton` (use MUI `Skeleton`).

### Phase 4-7: Feature Migration

- Library, Upload, Edit, Publish, Platforms pages.

### Phase 8: Cleanup

- Remove shadcn/ui, Tailwind, and legacy config.

## Active Decisions and Considerations

### UI Architecture

**MUI v6 Strategy**:

- **Theming**: CSS Variables (`cssVariables: true`) for performance and flexibility.
- **Dark Mode**: Native `colorSchemes` (light/dark) adaptation.
- **Styling**: Prefer `sx` prop for one-off styles, `styled()` for reusable components.
- **Icons**: Material Icons (`@mui/icons-material`) exclusively.
- **Layout**: `Grid` (v2) and `Stack` for layout primitives.

### Technology Choices Made

**Confirmed**:

- ✅ T3 Stack (Next.js + tRPC + Prisma + NextAuth)
- ✅ TypeScript for type safety
- ✅ App Router (not Pages Router)
- ✅ Server Components as default
- ✅ **Material-UI v6** (Replacing Tailwind/shadcn)

**Pending Video-Related Decisions**:

- Video storage provider (S3, R2, local, etc.)
- Video processing approach (client-side, server-side, service)

## Current Blockers

**None** - Phase 2 complete, ready for Phase 3.

**Next Action**: Begin MUI Migration Phase 3 (Generic UI Components).

## Environment Status

**Development Environment**: ✅ Ready

- Node.js and npm installed
- Dependencies installed (MUI added)
- Database initialized (SQLite)
- Build passes ✅

**Production Environment**: ⏳ Not Yet Configured

## Team Context

**Current Phase**: Solo development with AI assistance (Cline)

**Development Approach**:

- AI-driven with Memory Bank for context persistence
- Documentation-first approach
- Iterative development (Migration Phase by Phase)

## Quick Reference

- `MUI_MIGRATION_PLAN.md` - **Active Plan**
- `memory-bank/roadmap/overview.md` - Master roadmap
- `src/theme.ts` - MUI Theme Configuration
- `src/app/layout.tsx` - Root Layout (Providers)
