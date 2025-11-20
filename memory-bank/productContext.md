# Product Context: t3a-videoblade

## Why This Project Exists

**VideoBlade** exists to solve a critical pain point for content creators: **the tedious, time-consuming process of manually uploading the same video to multiple platforms.**

### The Problem

Content creators today need to be present on multiple video platforms to maximize reach and audience engagement. A typical workflow looks like this:

1. Upload video to YouTube (10-15 minutes)
2. Re-upload same video to Vimeo (10-15 minutes)
3. Re-upload to TikTok (10-15 minutes)
4. Re-upload to other platforms (10-15 minutes each)
5. Manually configure metadata for each platform
6. Track which platforms succeeded/failed
7. Retry failed uploads manually

**Total time**: 1-2 hours for a single video across 4-5 platforms.

### The Solution

VideoBlade provides **upload once, publish everywhere** functionality:

1. Upload video once to VideoBlade (5 minutes)
2. Select target platforms and configure settings
3. Click "Publish" - VideoBlade handles the rest
4. Monitor all platforms from unified dashboard

**Total time**: 10-15 minutes, with automation handling the distribution.

## Problems It Solves

### Content Creator Workflow Problems

- **Time Waste**: Eliminates repetitive manual uploads to each platform
- **Human Error**: Reduces mistakes in metadata entry across platforms
- **Inconsistency**: Ensures video is published consistently everywhere
- **Tracking Overhead**: Centralizes publish status monitoring
- **Scheduling Complexity**: Simplifies coordinated release timing

### Technical Foundation (Inherited from T3 Stack)

- **Type Safety**: End-to-end type safety from database to frontend eliminates runtime type errors
- **API Complexity**: tRPC removes the need for REST/GraphQL boilerplate while maintaining type safety
- **Authentication**: Pre-configured NextAuth.js handles user management and session handling
- **Database Integration**: Prisma provides a type-safe database layer with migrations
- **Developer Experience**: Rapid development with modern tooling and hot reload

## How It Should Work

### Current Functionality

#### Authentication Flow

1. User visits the homepage (Landing Page)
2. Can sign in via OAuth (Google, TikTok, Vimeo)
3. **Authenticated users are redirected to the Dashboard**
4. Session persists across page loads

#### Post Management

1. Logged-in users see their latest post
2. Posts are stored in SQLite database
3. Posts have name, timestamps, and author relationship
4. tRPC handles all API communication type-safely

#### UI/UX

- Clean, modern interface with gradient backgrounds
- Responsive design works on mobile and desktop
- Smooth transitions and hover effects
- Links to T3 documentation for learning

### Planned Functionality - VideoBlade Core Flows

#### 1. Platform Connection Flow

1. User signs in to VideoBlade
2. Navigates to "Connect Platforms" page
3. Clicks "Connect" for YouTube, TikTok, or Vimeo
4. OAuth redirect to platform authorization
5. Platform redirects back with auth token
6. VideoBlade stores connection and displays as "Connected"
7. User can manage/disconnect platforms anytime

#### 2. Video Upload Flow

1. User navigates to "Upload Video" page
2. Selects video file from computer (drag & drop or file picker)
3. Upload progress bar shows status
4. Video uploads to cloud storage (S3/R2)
5. Video appears in user's library with "Ready to Publish" status

#### 3. Batch Publishing Flow

1. User selects video from library
2. Clicks "Publish to Platforms"
3. Selects target platforms (YouTube, Vimeo, TikTok)
4. Configures metadata for each platform:
   - Title (can be same or platform-specific)
   - Description
   - Tags/keywords
   - Category
   - Visibility (public, unlisted, private)
   - Thumbnail (optional)
5. Clicks "Publish Now" or "Schedule"
6. Jobs are queued for each platform
7. Background workers process publish jobs
8. Dashboard updates with publish status per platform

#### 4. Scheduling Flow

1. User follows publish flow above
2. Instead of "Publish Now", selects "Schedule"
3. Sets publish date/time
4. Optionally sets different times per platform
5. Jobs are scheduled in queue
6. Automated workers execute at scheduled time
7. User receives notification when complete

#### 5. Analytics Dashboard Flow

1. User views unified **Analytics Dashboard** (default view)
2. Sees high-level performance metrics:
   - Total Views, Engagement, and Content Volume
   - Trend charts showing growth over time
   - Platform breakdown (YouTube vs TikTok vs Vimeo)
3. Can switch to "Library" or "Platforms" via sidebar for management
4. Can refresh data manually to get latest stats

## User Experience Goals

### MVP (Phase 1)

- **Simple**: One-click platform connection via OAuth
- **Fast**: Video upload with clear progress indication
- **Clear**: Status visibility for each platform publish
- **Reliable**: Error messages that explain what went wrong and how to fix
- **Guided**: Clear onboarding for first-time users

### Feature Complete (Phase 2)

- **Efficient**: Batch operations for multiple videos
- **Flexible**: Platform-specific metadata customization
- **Smart**: Remember preferences and suggest defaults
- **Organized**: Filter and search video library
- **Informative**: Publish history and analytics

### Production (Phase 3)

- **Robust**: Handle rate limits and retries gracefully
- **Fast**: Optimize for large video files and multiple platforms
- **Beautiful**: Polished, professional UI/UX
- **Accessible**: Mobile-responsive, keyboard navigation, ARIA labels
- **Helpful**: Contextual help and documentation

## Target Users

### Primary Persona: Multi-Platform Content Creator

**Name**: Sarah, Educational Content Creator

**Background**:

- Creates educational videos about web development
- Publishes to YouTube (main), Vimeo (backup), LinkedIn (professional)
- Posts 2-3 videos per week
- Spends 30-45 minutes per video just uploading to platforms

**Pain Points**:

- Manual uploads are tedious and time-consuming
- Sometimes forgets to upload to one platform
- Different metadata requirements per platform cause confusion
- Hard to track which videos are live on which platforms

**How VideoBlade Helps**:

- Reduces upload time from 45 minutes to 10 minutes
- Never misses a platform - selects all targets in one step
- Stores platform-specific templates for metadata
- Dashboard shows exactly what's published where

### Secondary Personas

**Marketing Team Manager**:

- Needs to distribute brand videos across multiple platforms
- Requires consistent branding and messaging
- Values time savings and process efficiency

**Indie Filmmaker**:

- Wants maximum distribution for films
- Publishes to YouTube, Vimeo, Dailymotion
- Limited time to manage multiple platforms

**Podcaster with Video**:

- Records video podcasts
- Distributes to YouTube, Spotify Video, TikTok clips
- Needs scheduling to coordinate with audio release

## Core User Stories

### Implemented (T3 Stack Foundation)

- As a user, I can sign in to access protected features
- As a user, I can create posts associated with my account
- As a user, I can view my latest post
- As a user, I can sign out to end my session

### MVP - Phase 1 (YouTube Only)

**Platform Connection**:

- As a content creator, I want to connect my YouTube account so I can publish videos to it
- As a user, I want to see which platforms I've connected so I know where I can publish
- As a user, I want to disconnect a platform so I can revoke access if needed

**Video Management**:

- As a content creator, I want to upload a video to VideoBlade so I can publish it to platforms
- As a user, I want to see upload progress so I know when my video is ready
- As a user, I want to view my video library so I can manage my content

**Publishing**:

- As a content creator, I want to publish a video to YouTube so it appears on my channel
- As a user, I want to configure video metadata (title, description) so my video has the right information
- As a user, I want to see publish status so I know if it succeeded or failed

### Phase 2 - Multi-Platform

**Batch Publishing**:

- As a content creator, I want to publish one video to multiple platforms simultaneously so I save time
- As a user, I want to customize metadata per platform so each has appropriate information
- As a user, I want to retry failed publishes so I don't lose my work

**Platform Support**:

- As a content creator, I want to connect Vimeo so I can have a backup platform
- As a content creator, I want to connect TikTok so I can reach mobile audiences
- As a user, I want platform-specific settings preserved so I don't re-enter them each time

### Phase 3 - Advanced Features

**Scheduling**:

- As a content creator, I want to schedule video publishes so they go live at optimal times
- As a user, I want different publish times per platform so I can stagger releases
- As a user, I want to see my scheduled publishes so I can track upcoming releases

**Organization**:

- As a content creator, I want to organize videos into collections so I can manage series
- As a user, I want to search my video library so I can find specific content quickly
- As a user, I want to tag videos so I can categorize them

## Success Metrics

### User Success Metrics

**Time Savings** (Primary Goal):

- Average time to publish to 3 platforms: < 15 minutes (vs 45-60 minutes manual)
- % reduction in publishing time: > 70%
- User-reported time savings per video

**Adoption & Engagement**:

- Number of platforms connected per user: Target average 3+
- Videos published per week per user: Tracking growth
- Publish success rate: > 95%
- User retention after 30 days: > 60%

**Publish Quality**:

- Failed publish rate: < 5%
- Time to detect failures: < 5 minutes
- Retry success rate: > 85%
- Average time to complete publish (all platforms): < 30 minutes

### Technical Success Metrics

**Performance**:

- Page load time: < 2 seconds
- Video upload speed: Limited by user bandwidth, progress updates every second
- API response time (p95): < 500ms
- Background job processing time: < 10 minutes per platform

**Reliability**:

- Uptime: > 99.5%
- Data loss rate: 0% (video uploads must be reliable)
- API error rate: < 1%
- Queue processing success rate: > 98%

**Code Quality**:

- TypeScript errors: 0
- ESLint warnings: 0
- Test coverage: > 80% (when tests implemented)
- Build success rate: 100%

### Business Metrics (Future)

- Monthly Active Users (MAU)
- Videos published per month
- Platform distribution (which platforms most popular)
- Conversion rate (free to paid, if applicable)
- Customer Lifetime Value

## Known Limitations

### Technical

- SQLite is development-only; production requires PostgreSQL
- NextAuth.js 5.0 is in beta (may have breaking changes)
- No video functionality implemented yet (foundation only)
- Large video files require chunked upload implementation
- Rate limits vary by platform and user tier

### Platform-Specific

**YouTube**:

- Daily quota limits (10,000 units per day default)
- Maximum file size varies by account verification status
- Some features require channel verification

**Vimeo**:

- Upload quota depends on account tier (free, Plus, Pro)
- Weekly upload limits on free/basic tiers
- Video quality options tier-dependent

**TikTok**:

- Maximum video length restrictions (varies by account)
- Different requirements for business vs creator accounts
- Limited API access (requires approval)

### Current State

- Video transcoding not implemented (users must upload ready-to-publish videos)
- No video preview/playback in VideoBlade (users see filename/metadata only)
- Platform analytics not integrated (users check platforms directly)
- No team/multi-user features

## Future Considerations

### Near-Term (Next 6 months)

- Additional platform integrations (Dailymotion, Facebook Video)
- Video thumbnail customization per platform
- Bulk upload (multiple videos at once)
- Template system for common metadata patterns
- Improved error messaging with fix suggestions

### Long-Term (6-12 months)

- Video transcoding for format compatibility
- In-app video preview and trimming
- Analytics dashboard (view counts across platforms)
- Team collaboration features
- API for programmatic access
- Mobile apps (iOS, Android)
- Browser extension for quick publishing

### Infrastructure Evolution

- Migrate to Cloudflare R2 for cost-effective storage
- Implement CDN for faster video delivery
- Scale background workers for high volume
- Add caching layer (Redis) for improved performance
- Multi-region deployment for global users
