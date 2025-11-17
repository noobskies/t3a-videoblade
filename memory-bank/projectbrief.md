# Project Brief: t3a-videoblade

## Project Identity

**Name**: t3a-videoblade  
**Type**: Full-stack web application  
**Framework**: T3 Stack (Next.js + tRPC + Prisma + NextAuth)  
**Status**: Foundation established, awaiting feature implementation

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

**Initial Support (MVP)**:

- YouTube Data API v3
- Vimeo API v3.4

**Future Platforms**:

- TikTok Content Posting API
- Dailymotion API
- Facebook Video API
- Instagram Video API
- Twitter/X Video API
- LinkedIn Video API

### Infrastructure Requirements

- **Storage**: S3-compatible object storage for video files
- **Queue**: Job queue system (BullMQ, Redis-based)
- **Database**: PostgreSQL for production (SQLite for development)
- **Caching**: Redis for queue and session management
- **File Processing**: Background workers for video upload handling

## Success Criteria

### Foundation (Current Phase)

- ✅ T3 Stack properly configured
- ✅ Authentication system working
- ✅ Database schema defined
- ✅ Development environment ready

### MVP (Phase 1)

- [ ] User can connect YouTube account via OAuth
- [ ] User can upload video to VideoBlade
- [ ] Video is stored in cloud storage
- [ ] User can publish video to connected YouTube account
- [ ] Basic dashboard shows publish status

### Feature Complete (Phase 2)

- [ ] Multiple platform support (YouTube + Vimeo + 2 others)
- [ ] Batch publishing to multiple platforms
- [ ] Scheduling system working
- [ ] Platform-specific metadata configuration
- [ ] Publish history and status tracking
- [ ] Retry logic for failed publishes

### Production Ready (Phase 3)

- [ ] Performance optimized
- [ ] Error handling comprehensive
- [ ] Monitoring and logging
- [ ] Rate limit handling per platform
- [ ] User quota management
- [ ] Analytics dashboard

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

## Notes

This project was bootstrapped with `create-t3-app` (v7.40.0). VideoBlade's multi-platform publishing vision is now defined and documented. Implementation focuses on API-first integration with major video platforms, queue-based distribution, and unified management interface.
