# Project Brief: t3a-videoblade

## Project Identity

**Name**: t3a-videoblade  
**Type**: Full-stack web application  
**Framework**: T3 Stack (Next.js + tRPC + Prisma + Better Auth)  
**Status**: Foundation complete, detailed roadmap ready - Begin Phase 1 implementation

**Implementation Roadmap**: See `memory-bank/roadmap/` for complete step-by-step guide

## Core Purpose

**VideoBlade** is a unified video management platform that enables content creators to publish videos to multiple video platforms simultaneously through their APIs. It solves the time-consuming problem of manually uploading the same video to YouTube, Vimeo, TikTok, and other platforms separately.

**Value Proposition**: Upload once, publish everywhere - streamline the multi-platform video distribution workflow.

## Current Scope

### Established Foundation

- Modern Next.js 15 application with App Router
- Type-safe API layer using tRPC
- Database integration with Prisma ORM (SQLite)
- Authentication system with NextAuth.js
- Responsive UI with Tailwind CSS
- TypeScript for full type safety

### Core Features (To Implement)

**Multi-Platform Upload**

- Connect to video platforms with supporting APIs (YouTube, Vimeo, TikTok, etc.)
- OAuth authentication for each platform
- Manage multiple platform connections per user
- Platform-specific metadata and settings

**Batch Publishing**

- Upload video once to VideoBlade
- Select target platforms for distribution
- Configure platform-specific settings (title, description, tags, visibility)
- Publish to all selected platforms simultaneously

**Scheduling**

- Queue videos for future release
- Set different publish times per platform
- Automatic job processing and retry logic
- Status tracking for each platform publish

**Unified Dashboard**

- View all connected platforms in one place
- Monitor publish status across platforms
- Manage video library centrally
- Track publish history and analytics

## Technical Requirements

### Must Have

- ✅ Next.js 15+ (App Router)
- ✅ Type-safe API (tRPC)
- ✅ Database ORM (Prisma)
- ✅ User authentication (NextAuth.js)
- ✅ Modern styling (Tailwind CSS)
- ✅ TypeScript support
- Cloud storage for video files (S3, R2, etc.)
- Queue system for background job processing
- Platform API SDKs (YouTube Data API, Vimeo API, TikTok API)
- OAuth support for multiple providers

### Platform API Integration

**Phase 1 (MVP)**:

- YouTube Data API v3

**Phase 2 (Multi-Platform)**:

- Rumble API

**Phase 3+ (Future Platforms - TBD)**:

- Vimeo API v3.4
- TikTok Content Posting API
- Dailymotion API
- Facebook Video API
- Instagram Video API
- Twitter/X Video API
- LinkedIn Video API

### Infrastructure Requirements

**Confirmed Tech Stack**:

- **Storage**: AWS S3 for video files
- **Queue**: Inngest (serverless background jobs - no Redis needed)
- **Database**: Vercel Postgres for production (SQLite for development)
- **Deployment**: Vercel
- **File Processing**: Inngest functions for background upload handling

**See `memory-bank/roadmap/overview.md` for complete architecture details**

## Success Criteria

### Foundation (Current Phase)

- ✅ T3 Stack properly configured
- ✅ Authentication system working
- ✅ Database schema defined
- ✅ Development environment ready

### Implementation Phase 1 (YouTube MVP)

See `memory-bank/roadmap/phase1/` for complete 11-file roadmap (28-42 hours)

- [ ] User can upload video to VideoBlade (stored in S3)
- [ ] User can connect YouTube account via OAuth
- [ ] User can publish video to YouTube with custom metadata
- [ ] Video library displays all videos with thumbnails
- [ ] User can edit video metadata
- [ ] User can retry failed publishes
- [ ] Platform connection management working

### Implementation Phase 2 (Multi-Platform - Rumble)

See `memory-bank/roadmap/phase2/` for complete 5-file roadmap (15-19 hours)

- [ ] Rumble OAuth & API integration
- [ ] Multi-platform publishing UI (YouTube + Rumble simultaneously)
- [ ] Platform-specific metadata handling
- [ ] Per-platform scheduled publishing
- [ ] Enhanced delete functionality
- [ ] Publish history per platform

### Future Expansion (Phase 3+) - TBD

Nice-to-have features to be planned after Phase 1 & 2 complete:

- Additional platforms (Vimeo, TikTok, etc.)
- Batch upload, analytics, team features, API access
- Performance optimization and production hardening

## Constraints

### Technical

- Using SQLite for development (PostgreSQL required for production)
- NextAuth.js 5.0 beta (stable patterns needed)
- Modern browser support required (React 19)
- Video file size limits based on platform restrictions
- API rate limits vary by platform

### Platform API Limitations

- **YouTube**: Daily quota limits, maximum file size
- **Vimeo**: Tier-dependent upload quotas
- **TikTok**: Maximum video duration restrictions
- Each platform has unique metadata requirements

### Business

- API credentials required for each platform
- OAuth approval process varies by platform
- Compliance with platform terms of service

## Non-Goals

- Not a video hosting platform (we distribute, not host permanently)
- Not a video editing tool (basic metadata only)
- Not a video analytics platform (just publish status)
- Not competing with platforms (we're a distribution tool)
- Not handling monetization or ads (platform-specific)

## Target Users

**Primary**: Content creators who publish the same video to multiple platforms

**Examples**:

- YouTubers who also post to Vimeo for backup
- Educational content creators distributing across platforms
- Marketing teams publishing brand videos everywhere
- Indie filmmakers maximizing distribution
- Podcasters publishing video versions across platforms

**User Characteristics**:

- Create one video, want it on 2+ platforms
- Value time savings over manual uploads
- Need consistent metadata across platforms
- Want scheduling and automation
- Require publish status visibility

## Development Approach

**Follow DRY/SOLID Principles**:

- Backwards compatibility is not a concern
- Implement solutions correctly from the start
- Refactor freely when better patterns emerge
- See `memory-bank/systemPatterns.md` for detailed principles

## Implementation Notes

This project was bootstrapped with `create-t3-app` (v7.40.0). VideoBlade's multi-platform publishing vision is fully defined and documented.

**Complete Implementation Roadmap**: `memory-bank/roadmap/`

- **Phase 1**: 11 detailed files for YouTube MVP (28-42 hours)
- **Phase 2**: 5 detailed files for Rumble integration (15-19 hours)
- **Phase 3**: TBD - Nice-to-have features for future

**Tech Stack**: AWS S3 + Inngest + Vercel Postgres + Vercel + YouTube & Rumble APIs

**Start Implementation**: 👉 `memory-bank/roadmap/phase1/00-prerequisites.md`
