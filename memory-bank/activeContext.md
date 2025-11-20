# Active Context: t3a-videoblade

## Current Focus

**Major Pivot**: Transforming into "MediaBlade" (Buffer Clone).
We have just completed **Phase 3, Step 4: Production Hardening** and realigned the entire roadmap to support the new vision.

## Recent Changes

- **Strategic Pivot**: Updated core documentation (`projectbrief.md`, `productContext.md`) to reflect the shift from "Video Tool" to "Comprehensive Media Manager".
- **Roadmap Restructuring**: Defined Phase 4 (Buffer Core) and Phase 5 (Expansion).
- **Production Hardening**:
  - **Sentry Integration**: Configured client/server/edge error tracking.
  - **Rate Limiting**: Implemented Upstash Redis rate limiter on all tRPC procedures.
  - **Upload Hardening**: Refactored upload limits to shared constants (`src/lib/constants.ts`).

## Active Decisions

- **Web-Only**: We are prioritizing the web application over a mobile app for now.
- **Buffer Features**: Prioritizing **Visual Calendar** and **Queue System** as the core differentiators for Phase 4.
- **Rate Limiting**: Applied globally to `publicProcedure` to prevent abuse, with user-based limits for `protectedProcedure`.

## Next Steps

1.  **Phase 4, Step 1: Multi-Format Infrastructure**
    - Update Prisma schema for `Post` type (VIDEO, IMAGE, TEXT).
    - Update Upload UI to handle images.
    - Update S3 logic for image optimization (optional/future).

2.  **Phase 4, Step 2: Visual Calendar**
    - Install calendar library (`react-big-calendar`).
    - Build the calendar view.

## Current Project State

- **Phase**: 3 (Hardening Complete) -> Transitioning to 4
- **Status**: Foundation Hardened, Ready for Feature Expansion.
