# Active Context: t3a-videoblade

## Current Work Focus

**Phase**: Phase 1 - MVP (YouTube Only) - In Progress  
**Current Step**: Step 1 Complete ✅ → Moving to Step 2 (S3 Upload)  
**Product**: VideoBlade - Multi-Platform Video Publishing Tool  
**Status**: Database schema complete, ready for video upload implementation  
**Last Updated**: 2025-11-17 (3:29 PM)

## Recent Changes

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
