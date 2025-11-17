# Active Context: t3a-videoblade

## Current Work Focus

**Phase**: Phase 1 - MVP (YouTube Only) - In Progress  
**Current Step**: Step 5 Complete ✅ → Moving to Step 6 (Metadata Editing)  
**Product**: VideoBlade - Multi-Platform Video Publishing Tool  
**Status**: Platform Management UI complete - users can connect/disconnect YouTube  
**Last Updated**: 2025-11-17 (5:28 PM)

## Recent Changes

### Phase 1, Step 5: Platform Management UI Complete (2025-11-17 - 5:28 PM)

**Platform Management UI**: ✅ ALL FEATURES IMPLEMENTED

**Major Achievement**: Built complete platform management UI following Step 3's architecture patterns. Domain-based type organization extended to platform types.

**Files Created** (1 new):

- ✅ `src/lib/types/platform.ts` - Platform domain types with explicit interfaces
- ✅ `src/app/platforms/page.tsx` - Platform management page

**Files Modified** (2 existing):

- ✅ `src/lib/types/index.ts` - Added platform type exports
- ✅ `src/app/layout.tsx` - Added Platforms link to navigation

**Platform Management Features**:

- ✅ Platforms page at `/platforms` with YouTube connection card
- ✅ "Connect" button → creates PlatformConnection from existing Google OAuth
- ✅ "Disconnect" button with confirmation dialog
- ✅ Connection status display (green check when connected)
- ✅ Channel name and connection date displayed
- ✅ Professional UI matching existing shadcn/ui styling
- ✅ Loading and error states handled
- ✅ Navigation updated with Platforms link

**Architecture Patterns Established**:

- ✅ Platform types follow Step 3's domain-based organization
- ✅ Explicit `PlatformConnection` interface
- ✅ Local type guard for runtime validation
- ✅ Type-safe implementation with zero unsafe operations
- ✅ Reuses Better Auth Google OAuth (no additional OAuth flow)

**Testing Results**:

```
✅ Page compiled successfully at /platforms
✅ platform.list query working
✅ platform.connectYouTube mutation working
✅ PlatformConnection created in database
✅ Disconnect flow working (connection deleted)
✅ Navigation links all working
✅ All tRPC procedures verified
```

**User Flow Working**:

1. User navigates to `/platforms` page
2. Sees YouTube card with "Connect" button
3. Clicks Connect → PlatformConnection created from Google OAuth
4. Shows "Connected" status with channel name
5. Can disconnect with confirmation
6. All state updates work correctly

**Code Quality Results**:

- ✅ Domain-based type organization (`src/lib/types/platform.ts`)
- ✅ Explicit interfaces for better ESLint compatibility
- ✅ Type guards for runtime validation
- ✅ Following established patterns from Step 3
- ✅ Professional shadcn/ui styling
- ✅ Responsive design

**Time to Complete**: ~30 minutes (beat 2-3 hour estimate!)

**Next Step**: 👉 Step 6: Metadata Editing (`memory-bank/roadmap/phase1/06-metadata-editing.md`)

### Phase 1, Step 4: YouTube OAuth Verification Complete (2025-11-17 - 4:43 PM)

**YouTube OAuth Integration**: ✅ ALL FEATURES IMPLEMENTED

**Major Achievement**: YouTube OAuth fully verified and working with Better Auth. Platform connection system ready for publishing.

**Files Created** (2 new):

- ✅ `src/server/api/routers/platform.ts` - Platform management router
- ✅ `scripts/test-youtube-oauth.ts` - OAuth verification test script

**Files Modified** (1 existing):

- ✅ `src/server/api/root.ts` - Added platform router to app router

**Platform Router Features**:

- ✅ `list` - Get user's connected platforms
- ✅ `connectYouTube` - Create PlatformConnection from Google OAuth
- ✅ `disconnect` - Remove platform connection
- ✅ Security: Ownership checks, tokens never exposed to client
- ✅ Automatic token refresh support via Better Auth

**Better Auth Configuration Verified**:

- ✅ YouTube scopes present: `youtube.upload`, `youtube.readonly`
- ✅ Offline access enabled (`accessType: "offline"`)
- ✅ Refresh tokens working (won't expire after 1 hour)
- ✅ Proper token expiry tracking

**Testing Results**:

```
✅ Google account found
✅ Access token: Present
✅ Refresh token: Present
✅ YouTube API access working!
✅ Channel: NoobSkie
✅ Channel ID: UCb1tfNevQJrunFheTISCjPw
```

**OAuth Flow Working**:

1. User signs in with Google → Better Auth stores tokens
2. User calls `platform.connectYouTube` → Creates PlatformConnection
3. PlatformConnection ready for video publishing
4. Tokens automatically refresh when expired

**Security Implementation**:

- ✅ Tokens stored server-side only (never sent to client)
- ✅ Protected procedures require authentication
- ✅ Ownership checks prevent unauthorized access
- ✅ API responses only include metadata (no sensitive tokens)

**Time to Complete**: ~30 minutes (beat 2-hour estimate!)

**Next Step**: 👉 Step 5: Platform Management UI (`memory-bank/roadmap/phase1/05-platform-management.md`)

### Phase 1, Step 3: Video Library UI + Architecture Refactoring Complete (2025-11-17 - 4:24 PM)

**Video Library Implementation**: ✅ ALL FEATURES IMPLEMENTED

**Major Achievement**: Implemented video library UI AND performed comprehensive architecture refactoring following Code Quality Over Backwards Compatibility principle.

#### Part 1: Initial Implementation with shadcn/ui

**shadcn/ui Components Installed**:

- ✅ Card - Professional video card layout
- ✅ Button - Consistent action buttons
- ✅ Badge - Color-coded status indicators

**Files Created** (5 new):

- ✅ `src/components/ui/card.tsx` - shadcn Card component
- ✅ `src/components/ui/button.tsx` - shadcn Button component
- ✅ `src/components/ui/badge.tsx` - shadcn Badge component
- ✅ `src/app/_components/video-card.tsx` - Video card component
- ✅ `src/app/library/page.tsx` - Video library page

**Files Modified** (1 existing):

- ✅ `src/app/layout.tsx` - Added navigation bar with Library/Upload links

**Library Features Working**:

- ✅ Responsive grid layout (1-4 columns based on screen size)
- ✅ Video cards with thumbnails (or placeholder icon)
- ✅ Metadata display (title, description, file size, date, privacy)
- ✅ Color-coded publish status badges
- ✅ Delete functionality with confirmation
- ✅ Empty state with upload CTA
- ✅ Professional shadcn/ui styling

#### Part 2: Architecture Refactoring (Following DRY/SOLID)

**Problem Identified**: Initial implementation used `eslint-disable` comments to bypass type safety errors - violated core "Code Quality First" principle.

**Solution**: Comprehensive refactoring to establish professional patterns.

**Type System Refactoring**:

- ✅ Created domain-based type organization: `src/lib/types/`
- ✅ `src/lib/types/video.ts` - Video domain types
- ✅ `src/lib/types/common.ts` - Utility types
- ✅ `src/lib/types/index.ts` - Barrel export
- ✅ Deleted monolithic `src/lib/types.ts`
- ✅ Explicit interfaces instead of complex type inference
- ✅ Zero unsafe type operations

**Next.js File Conventions**:

- ✅ `src/app/library/error.tsx` - Automatic error boundary
- ✅ `src/app/library/loading.tsx` - Automatic loading state
- ✅ Simplified `page.tsx` - removed manual loading/error checks
- ✅ Proper state handling with type guards

**Component Renaming**:

- ✅ `loading-state.tsx` → `loading-skeleton.tsx` (component-level use)
- ✅ `error-state.tsx` → `error-alert.tsx` (component-level use)
- ✅ Added clear JSDoc documentation

**Component Structure**:

- ✅ Single Responsibility: Each component has one clear purpose
- ✅ Header, VideoGrid, EmptyState extracted as focused components
- ✅ Reusable LoadingSkeleton and ErrorAlert for component-level states

**Code Quality Results**:

- ✅ **ZERO TypeScript errors**
- ✅ **ZERO ESLint type safety errors**
- ✅ Only 1 warning about `<img>` vs `<Image>` (performance, not safety)
- ✅ No `any` types or eslint-disable comments
- ✅ Follows all DRY/SOLID principles

**Testing Status**:

- ✅ Dev server running successfully
- ✅ Library page accessible at `/library`
- ✅ Video cards display correctly with shadcn styling
- ✅ Navigation working (Home, Library, Upload)
- ✅ All tRPC queries working
- ✅ Responsive grid tested (1-4 columns)

**Time to Complete**: ~3 hours total

- Initial implementation: 1.5 hours
- Refactoring: 1.5 hours
- Result: Professional, scalable architecture with zero technical debt

**Next Step**: 👉 Step 4: YouTube OAuth Verification (`memory-bank/roadmap/phase1/04-youtube-oauth.md`)

## Recent Changes

### Phase 1, Step 2: S3 Video Upload Complete (2025-11-17 - 3:50 PM)

**Video Upload System**: ✅ ALL FEATURES IMPLEMENTED

**Files Created** (4 new):

- ✅ **`src/lib/s3.ts`** - S3 utilities (presigned URLs, key generation, file deletion)
- ✅ **`src/server/api/routers/video.ts`** - Video tRPC router with 4 procedures
- ✅ **`src/app/_components/video-upload.tsx`** - Upload component with progress tracking
- ✅ **`src/app/upload/page.tsx`** - Upload page at `/upload`

**Files Modified** (2 existing):

- ✅ **`src/env.js`** - Made AWS S3 environment variables required (not optional)
- ✅ **`src/server/api/root.ts`** - Added video router to app router

**Upload Flow Implemented**:

1. **Request Presigned URL** → Server generates S3 presigned URL (expires in 10 minutes)
2. **Upload to S3** → Client uploads directly to S3 with real-time progress tracking
3. **Confirm Upload** → Server creates Video record in database with metadata

**Features Working**:

- ✅ Secure presigned URL uploads (no file passes through Next.js server)
- ✅ Real-time progress tracking with XMLHttpRequest (0-100%)
- ✅ File size validation (max 5GB per file)
- ✅ Video type validation (video/\* MIME types only)
- ✅ BigInt handling for large file sizes
- ✅ Ownership-based access control (users can only see/delete their own videos)
- ✅ Automatic form reset after successful upload

**tRPC Procedures**:

- `video.getUploadUrl` - Generate presigned S3 URL and unique key
- `video.confirmUpload` - Create Video record after successful S3 upload
- `video.list` - Get all user's videos with publish job status
- `video.delete` - Delete video from S3 and database (with ownership check)

**Testing Status**:

- ✅ Dev server started successfully
- ✅ Upload page accessible at `/upload`
- ✅ Uploaded 26.8 MB MP4 video successfully
- ✅ Progress bar displayed correctly (0% → 100%)
- ✅ Video record created in database with correct metadata
- ✅ S3 file stored at `videos/{userId}/{timestamp}-{random}.mp4`
- ✅ All tRPC procedures working as expected

**Database Record Verified**:

```
Video {
  id: cmi3o2zpq0001nhu9bvirt62v
  s3Key: videos/JiwTalO2euKv4e7GOJpXvXCs6fzMPSXL/1763415534155-749hnc.mp4
  s3Bucket: videoblade-dev-videos
  fileName: 5752729-uhd_3840_2160_30fps.mp4
  fileSize: 26836582 (26.8 MB)
  title: 5752729-uhd_3840_2160_30fps
  description: test description
  privacy: UNLISTED
  createdById: JiwTalO2euKv4e7GOJpXvXCs6fzMPSXL
}
```

**S3 Structure Confirmed**:

```
videoblade-dev-videos/
  └── videos/
      └── {userId}/
          └── {timestamp}-{randomId}.mp4
```

**Time to Complete**: ~2 hours (beat 4-6 hour estimate!)

**Next Step**: 👉 Step 3: Video Library UI (`memory-bank/roadmap/phase1/03-video-library.md`)

### Phase 1, Step 1: Database Schema Complete (2025-11-17 - 3:25 PM)

**Database Foundation**: ✅ ALL MODELS IMPLEMENTED

**Models Created**:

- ✅ **Enums**: Platform (YOUTUBE, RUMBLE), PublishStatus (5 states), VideoPrivacy (3 levels)
- ✅ **Video Model**: S3 storage references, metadata, file details (BigInt for sizes)
- ✅ **PlatformConnection Model**: OAuth tokens per user/platform with unique constraints
- ✅ **PublishJob Model**: Publishing queue with status tracking and retry logic
- ✅ **User Model**: Updated with relations to videos, platformConnections, publishJobs

**Schema Features**:

- Cascading deletes for data integrity
- Performance indexes on frequently queried fields (createdById, status, platform)
- CUID IDs for distributed system compatibility
- Unique constraint: one platform connection per user per platform
- JSON support for flexible platform-specific metadata

**Supporting Files**:

- Created: `src/lib/validators.ts` - Zod validation schemas for all models
- Created: `scripts/test-db-schema.ts` - Comprehensive test suite (6 scenarios)

**Testing Status**:

- ✅ Schema pushed to SQLite database successfully
- ✅ Prisma Client regenerated with new types
- ✅ All 6 test scenarios passed (create, query, update, relations, cleanup)
- ✅ Prisma Studio verified tables exist at http://localhost:5555

**Database Operations Verified**:

1. Video creation with S3 metadata
2. Platform connection with OAuth tokens
3. Publish job creation with platform targeting
4. Complex queries with nested includes
5. Job status updates
6. User queries with all VideoBlade relations

**Time to Complete**: ~2-3 hours (as estimated)

**Next Step**: 👉 Step 2: S3 Video Upload Implementation (`memory-bank/roadmap/phase1/02-s3-upload.md`)

### Phase 1, Step 0: Prerequisites Complete (2025-11-17 - 3:17 PM)

**Infrastructure Setup**: ✅ ALL EXTERNAL SERVICES CONFIGURED

**Completed Setup**:

- ✅ AWS S3 bucket created: `videoblade-dev-videos`
- ✅ AWS IAM user with S3 permissions configured
- ✅ S3 test passed: Successfully uploaded test file
- ✅ Inngest account created with API keys configured
- ✅ YouTube Data API v3 enabled in Google Cloud Console
- ✅ OAuth consent screen configured with YouTube scopes
- ✅ Google OAuth credentials verified with YouTube API access

**Packages Installed**:

- `inngest` - Background job processing
- `@aws-sdk/client-s3` - AWS S3 client
- `@aws-sdk/s3-request-presigner` - Presigned URL generation
- `dotenv` - Environment variable loading for scripts

**Files Created/Updated**:

- Updated: `.env.example` - Added AWS S3 and Inngest variables
- Updated: `src/env.js` - Added validation for new environment variables
- Created: `scripts/test-s3.ts` - S3 connectivity test script
- Created: `SETUP-GUIDE.md` - Comprehensive setup instructions
- Updated: `.env` - All credentials configured (AWS, Inngest, YouTube)

**Testing Status**:

- ✅ S3 connectivity verified
- ✅ Environment variables validated
- ✅ Ready for database schema implementation

**Next Step**: 👉 Step 1: Database Schema Design (`memory-bank/roadmap/phase1/01-database-schema.md`)

### Better Auth Migration Complete (2025-11-17)

**Migration from NextAuth.js to Better Auth**:

- Migrated from NextAuth.js 5.0 beta → Better Auth 1.3.4+
- Google OAuth configured with YouTube API scopes (upload, readonly)
- Refresh token support enabled (`accessType: "offline"`)
- Clean database schema (following Code Quality Over Backwards Compatibility principle)
- Modern React hooks for client-side auth
- Type-safe authentication working end-to-end

**Why Better Auth?**:

- **YouTube OAuth Ready**: Custom scopes for YouTube API easily configured
- **Refresh Tokens**: Automatic offline access for long-lived platform connections
- **Framework Agnostic**: Easier to extract API if needed later
- **Modern TypeScript**: Better DX and type safety
- **Plugin Ecosystem**: Ready for 2FA, passkeys, magic links
- **Simpler Codebase**: More transparent than NextAuth

**Files Changed**:

- Created: `src/server/auth.ts` (Better Auth config)
- Created: `src/lib/auth-client.ts` (React client hooks)
- Created: `src/app/_components/auth-button.tsx` (Google sign-in button)
- Created: `src/app/api/auth/[...all]/route.ts` (Auth API handler)
- Updated: `prisma/schema.prisma` (Better Auth schema with emailVerified as Boolean)
- Updated: `src/server/api/trpc.ts` (Context uses `auth.api.getSession()`)
- Updated: `src/app/page.tsx` (Server component auth check)
- Updated: `.env` and `src/env.js` (Better Auth environment variables)
- Deleted: Old NextAuth files (`src/server/auth/` directory)

**Testing Status**: ✅ Google OAuth sign-in working successfully

### Complete Implementation Roadmap Created (2025-11-17)

**Roadmap Status**: ✅ Complete for Phase 1 & 2

**Structure**:

- `memory-bank/roadmap/overview.md` - Master roadmap with architecture and timeline
- `memory-bank/roadmap/phase1/` - 11 detailed files for MVP (YouTube only)
- `memory-bank/roadmap/phase2/` - 5 detailed files for Rumble + multi-platform
- `memory-bank/roadmap/phase3/` - TBD (nice-to-have features like additional platforms, analytics, team features)

**Phase 1 (MVP - YouTube Only)**: 28-42 hours estimated

- Infrastructure setup (AWS S3, Inngest, YouTube API)
- Database schema design
- Video upload to S3 with progress tracking
- Video library UI
- YouTube OAuth integration
- Platform connection management
- Video metadata editing
- Background job processing (Inngest)
- YouTube video publishing
- Thumbnail display
- Retry logic for failed publishes

**Phase 2 (Multi-Platform)**: 15-19 hours estimated

- Rumble OAuth & API integration
- Rumble video publishing
- Multi-platform publishing UI (YouTube + Rumble simultaneously)
- Enhanced delete functionality
- Per-platform scheduled publishing

**Tech Stack Confirmed**:

- AWS S3 for storage
- Inngest for background jobs (no Redis needed!)
- Vercel Postgres for production database
- Vercel for deployment
- YouTube & Rumble API integrations

**Memory Bank Updated**:

- ✅ `projectbrief.md` - Updated with VideoBlade multi-platform publishing vision
- ✅ `productContext.md` - Detailed user flows, personas, and success metrics
- ✅ `systemPatterns.md` - Development principles added (DRY/SOLID, code quality first)
- ✅ `techContext.md` - Technology stack documented, Better Auth migration complete
- ✅ `roadmap/overview.md` - Complete implementation roadmap
- ✅ `roadmap/phase1/` - 11 actionable files (00-10)
- ✅ `roadmap/phase2/` - 5 actionable files (01-05)

### Project Setup (Pre-existing + Updates)

The project was initialized with `create-t3-app` (v7.40.0) and includes:

- ✅ Next.js 15 with App Router
- ✅ React 19
- ✅ TypeScript configuration
- ✅ tRPC API layer
- ✅ Prisma ORM with SQLite
- ✅ **Better Auth authentication** (migrated from NextAuth.js)
- ✅ **Google OAuth with YouTube scopes** configured
- ✅ Tailwind CSS styling
- ✅ ESLint and Prettier
- ✅ Example post functionality

## Next Steps

### Immediate (Begin Phase 1 Implementation)

**Start here**: 👉 `memory-bank/roadmap/phase1/00-prerequisites.md`

The roadmap is complete and ready to follow sequentially:

1. **Phase 1 Step 0**: Infrastructure setup (AWS S3, Inngest, YouTube API credentials)
2. **Phase 1 Step 1**: Database schema design and migrations
3. **Phase 1 Step 2**: Video upload to S3 implementation
4. Continue through all Phase 1 files (00-10)
5. Then proceed to Phase 2 (01-05)
6. Phase 3 is TBD for nice-to-have features

Each roadmap file includes:

- Clear goals and time estimates
- Prerequisites checklist
- Step-by-step tasks with code examples
- Testing procedures
- Common issues and solutions
- Links to next steps

### Phase 1: MVP - YouTube Only (2-3 weeks)

**Database Schema**:

1. Design schema for Video, Platform, PlatformConnection, PublishJob models
2. Implement Prisma migrations
3. Add necessary indexes

**Platform Integration**:

1. Set up YouTube OAuth (Google Cloud Console)
2. Implement NextAuth YouTube provider
3. Store YouTube access/refresh tokens
4. Test OAuth flow

**Video Upload**:

1. Choose cloud storage provider (Cloudflare R2 recommended)
2. Implement tRPC video upload endpoint (presigned URLs)
3. Build upload UI with progress tracking
4. Store video metadata in database

**Publishing System**:

1. Set up job queue (BullMQ + Redis)
2. Implement YouTube API integration
3. Create publish worker for background processing
4. Build publish UI (select video → configure → publish)

**Dashboard**:

1. Build video library page
2. Create platform connections page
3. Show publish status per video
4. Display error messages and retry options

### Phase 2: Multi-Platform (3-4 weeks)

1. Add Vimeo OAuth and API integration
2. Implement platform-specific metadata handling
3. Build batch publishing UI
4. Add publish history tracking
5. Implement retry logic for failures

### Phase 3: Scheduling & Polish (2-3 weeks)

1. Add job scheduling to queue system
2. Build scheduling UI
3. Implement notifications (email/in-app)
4. Polish UI/UX
5. Add comprehensive error handling

### Infrastructure Setup

**Immediate Needs**:

- Cloudflare R2 account for video storage
- Redis instance for job queue (local dev, managed for production)
- YouTube API credentials (Google Cloud Console)
- PostgreSQL for production (can start with SQLite)

**Production Deployment**:

- Choose platform: Vercel (recommended for Next.js)
- Set up managed PostgreSQL (Vercel Postgres, Railway, or Supabase)
- Configure Redis (Upstash Redis recommended)
- Set up environment variables
- Configure OAuth callback URLs

## Active Decisions and Considerations

### Technology Choices Made

**Confirmed**:

- ✅ T3 Stack (Next.js + tRPC + Prisma + NextAuth)
- ✅ TypeScript for type safety
- ✅ App Router (not Pages Router)
- ✅ Server Components as default
- ✅ SQLite for development
- ✅ Tailwind CSS for styling

**Pending Video-Related Decisions**:

- Video storage provider (S3, R2, local, etc.)
- Video processing approach (client-side, server-side, service)
- Video player library (Video.js, Plyr, native)
- Supported video formats and codecs
- Maximum file size limits
- Thumbnail generation strategy
- Transcoding requirements

### Architecture Decisions

**Current Pattern**: Monolithic Next.js application

- All features in one codebase
- Database, API, and frontend together
- Suitable for MVP and early development

**Future Consideration**: May need to separate concerns as scale grows

- Video processing could be separate service
- Storage and CDN external
- API could be extracted if needed

### Performance Considerations

**Current State**:

- Development timing middleware active (100-500ms artificial delay)
- React Query caching configured
- Server Components reduce client JavaScript
- Turbopack for fast development builds

**Video-Related Performance Needs**:

- Large file upload handling
- Progress indicators for uploads
- Streaming optimization
- Lazy loading for video thumbnails
- Efficient pagination for video lists

## Important Patterns and Preferences

### Development Principles (CRITICAL)

**Code Quality Over Backwards Compatibility** - See `systemPatterns.md` for full details

These principles are **non-negotiable** and guide all development decisions:

1. **Never compromise code quality for backwards compatibility**
   - Refactor code properly when needed
   - Break things if necessary to do it right
   - Address technical debt immediately

2. **DRY (Don't Repeat Yourself)**
   - Extract common logic into reusable functions/components
   - Single source of truth for business logic

3. **SOLID Principles**
   - Single Responsibility: Each function/component does one thing
   - Open/Closed: Extend through composition, not modification
   - Type-safe interfaces and consistent patterns

4. **Maintainability**
   - Clear over clever code
   - Leverage TypeScript fully (no `any` without justification)
   - Refactor freely when patterns emerge

5. **When to Break Things**: It's encouraged to break backwards compatibility when:
   - Current implementation violates SOLID principles
   - Code duplication can be eliminated
   - Better architecture pattern is discovered
   - Type safety can be improved

**Remember**: These principles are documented in detail in `memory-bank/systemPatterns.md` under "Development Principles"

### Code Organization

**Established Patterns**:

1. **Server Components by Default**: Only use `"use client"` when necessary
2. **Private Components**: Use `_components/` directory for component organization
3. **tRPC Routers**: One router per domain area (posts, videos, etc.)
4. **Type Safety**: Never use `any` without documented reason
5. **Environment Variables**: Always add to `src/env.js` for validation

### File Naming Conventions

- Server components: `page.tsx`, `layout.tsx`
- Client components: Any name, must have `"use client"` directive
- API routes: `route.ts`
- tRPC routers: Descriptive name (e.g., `post.ts`, `video.ts`)

### Database Patterns

- Use Prisma relations for data relationships
- Always include `createdAt` and `updatedAt` timestamps
- Use `@default(cuid())` for IDs (not autoincrement for distributed systems)
- Index frequently queried fields

### API Patterns

- Input validation with Zod schemas
- Use `publicProcedure` for open endpoints
- Use `protectedProcedure` for authenticated endpoints
- Return type-safe objects, avoid `void` returns
- Handle errors with `TRPCError`

## Learnings and Project Insights

### T3 Stack Benefits Observed

1. **Type Safety**: End-to-end types eliminate entire classes of bugs
2. **Developer Experience**: Instant feedback, auto-completion everywhere
3. **Reduced Boilerplate**: tRPC eliminates REST/GraphQL ceremony
4. **Modern Defaults**: Best practices built in from the start

### Potential Challenges Ahead

1. **NextAuth.js Beta**: May encounter breaking changes or incomplete docs
2. **SQLite to PostgreSQL**: Migration will require careful planning
3. **Video Processing**: Complex domain with many technical considerations
4. **File Uploads**: Need robust error handling and progress tracking
5. **Storage Costs**: Video files require significant storage capacity

### Best Practices Established

- Keep Memory Bank updated after significant changes
- Document architectural decisions and rationale
- Use TypeScript's type system fully
- Follow T3 Stack conventions
- Maintain separation between server and client code

## Current Blockers

**None** - Vision is defined, ready to begin implementation.

**Next Action**:Begin Phase 1 implementation starting with `roadmap/phase1/00-prerequisites.md`.

## Environment Status

**Development Environment**: ✅ Ready

- Node.js and npm installed
- Dependencies installed
- Prisma client generated
- Database initialized (SQLite)
- TypeScript configured
- Linting and formatting configured

**Production Environment**: ⏳ Not Yet Configured

Needed for deployment:

- PostgreSQL database
- Cloud storage for videos
- Environment variables configured
- OAuth providers set up (if needed)
- Deployment platform selected

## Team Context

**Current Phase**: Solo development with AI assistance (Cline)

**Development Approach**:

- AI-driven with Memory Bank for context persistence
- Documentation-first approach
- Iterative development
- Test locally before committing

## Quick Reference

### Most Important Files

- `memory-bank/roadmap/overview.md` - **START HERE** - Master roadmap
- `memory-bank/roadmap/phase1/00-prerequisites.md` - **Phase 1 starts here**
- `memory-bank/projectbrief.md` - Project scope and goals
- `memory-bank/mcpServers.md` - Available MCP development tools
- `prisma/schema.prisma` - Database schema
- `src/server/api/routers/` - API endpoints
- `src/app/page.tsx` - Homepage
- `src/env.js` - Environment variables
- `.env` - Local environment configuration

### Common Commands

```bash
npm run dev          # Start development server
npm run db:studio    # Open database GUI
npm run db:push      # Update database schema
npm run check        # Lint + typecheck
```

### Development Tools (MCP Servers)

Powerful tools available via Model Context Protocol:

- **next-devtools**: Next.js debugging, browser automation, runtime inspection
- **Context7**: AI-powered library documentation retrieval
- **Sentry**: Error tracking and production monitoring (pre-configured)

**See `memory-bank/mcpServers.md` for detailed usage and VideoBlade-specific use cases.**

### Quick Links

- [T3 Stack Docs](https://create.t3.gg/)
- [Next.js App Router](https://nextjs.org/docs)
- [tRPC Docs](https://trpc.io/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org/)

## Notes for Future Sessions

After each memory reset, I (Cline) will read all Memory Bank files to understand the project state. Key reminders:

1. **Read ALL Memory Bank files** at the start of each session
2. **Roadmap is COMPLETE** - Follow `memory-bank/roadmap/phase1/00-prerequisites.md` to start
3. **MCP servers available** - Use next-devtools, Context7, and Sentry (see `mcpServers.md`)
4. **Project is "VideoBlade"** - Multi-platform video publishing tool
5. **T3 Stack foundation is complete** - now implement video features per roadmap
6. **SQLite is temporary** - production needs PostgreSQL
7. **Document new patterns** as they emerge during feature development
8. **Update Memory Bank** after significant changes or new learnings
9. **Phase 3 is TBD** - nice-to-have features for future consideration
