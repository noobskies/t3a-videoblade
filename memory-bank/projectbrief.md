# Project Brief: t3a-videoblade

## Project Identity

**Name**: t3a-videoblade (evolving to "MediaBlade" vision)
**Type**: Full-stack Social Media Management Platform
**Framework**: T3 Stack (Next.js + tRPC + Prisma + Better Auth)
**Status**: Foundation complete, pivoting to full "Buffer Clone" scope.

**Implementation Roadmap**: See `memory-bank/roadmap/` for complete step-by-step guide

## Core Purpose

**VideoBlade** is transforming into a **comprehensive social media management platform** (a "Buffer Clone"). It enables content creators and social media managers to **plan, schedule, publish, and engage** across all major platforms from a single dashboard. It handles not just video, but also images and text-based posts.

**Value Proposition**: Your central command center for social media. Plan visually, schedule automatically, and engage globally.

## Current Scope

### Established Foundation

- Modern Next.js 15 application with App Router
- Type-safe API layer using tRPC
- Database integration with Prisma ORM (PostgreSQL)
- Authentication system with Better Auth
- Responsive UI with Material UI (MUI v7)
- Basic Video Upload & Publishing (YouTube, TikTok, Vimeo)

### Core Features (To Implement - "Buffer Clone")

**1. Unified Media Support**

- Support for **Video**, **Image**, and **Text** posts.
- Platform-specific media optimization.

**2. Visual Calendar**

- Drag-and-drop content calendar.
- Month, Week, and List views.
- Visual planning of social strategy.

**3. Smart Queue System**

- "Buffer" style queueing: Define slots (e.g., "Mon-Fri 9AM") and just add content to the queue.
- Auto-scheduling based on next available slot.

**4. Multi-Platform Publishing**

- **Video**: YouTube, TikTok, Vimeo (Done/In Progress)
- **Social**: LinkedIn, X (Twitter), Instagram, Facebook (Planned)

**5. Unified Inbox (Engagement)**

- Aggregated comments and messages.
- Reply directly from the dashboard.

**6. Team Collaboration**

- Workspaces for teams.
- Approval workflows (Draft -> Review -> Scheduled).

## Technical Requirements

### Must Have

- ✅ Next.js 15+ (App Router)
- ✅ Type-safe API (tRPC)
- ✅ Database ORM (Prisma)
- ✅ User authentication (Better Auth)
- ✅ Modern styling (MUI v7)
- **Visual Calendar Component** (`react-big-calendar` or similar)
- **Job Queue System** (Inngest) for scheduled publishing
- **Rate Limiting** (Upstash) for API protection
- **Error Tracking** (Sentry)

### Platform API Integration

**Phase 1 (Video Foundation - Complete)**:

- YouTube Data API v3
- TikTok Content Posting API
- Vimeo API

**Phase 2 (Social Expansion - Planned)**:

- LinkedIn API (Text/Image/Video)
- X (Twitter) API v2
- Instagram Graph API
- Facebook Graph API

### Infrastructure Requirements

**Confirmed Tech Stack**:

- **Storage**: AWS S3 for media files
- **Queue**: Inngest (serverless background jobs)
- **Database**: Vercel Postgres
- **Deployment**: Vercel
- **Rate Limiting**: Upstash Redis
- **Observability**: Sentry

## Success Criteria

### Foundation (Current Phase)

- ✅ T3 Stack properly configured
- ✅ Authentication system working
- ✅ Video uploading & publishing working (YouTube/TikTok/Vimeo)
- ✅ Analytics Dashboard (Basic)

### Implementation Roadmap

**Phase 3: Stability & Hardening (Immediate)**

- [ ] Sentry Error Tracking
- [ ] Rate Limiting & Security
- [ ] Upload Hardening

**Phase 4: Core Buffer Experience**

- [ ] Multi-format DB schema (Image/Text)
- [ ] Visual Calendar UI
- [ ] Smart Queue Logic
- [ ] Ideas/Drafts System

**Phase 5: Platform Expansion**

- [ ] LinkedIn Integration
- [ ] X (Twitter) Integration
- [ ] Instagram/Facebook Integration

**Phase 6: Engagement**

- [ ] Unified Inbox
- [ ] Reply functionality

## Non-Goals (MVP)

- Mobile App (Web-only for now)
- AI Content Generation (Future)
- Paid Media/Ad Management
- Link Shortening (Raw links for MVP)

## Target Users

**Primary**: Social Media Managers & Content Creators

- Manage multiple accounts
- Need visual planning tools
- Value "set and forget" scheduling

## Implementation Notes

**Complete Implementation Roadmap**: `memory-bank/roadmap/`
