# Active Context: t3a-videoblade

## Current Work Focus

**Phase**: Planning and Architecture Design  
**Product**: VideoBlade - Multi-Platform Video Publishing Tool  
**Status**: Vision defined, ready for implementation planning  
**Last Updated**: 2025-11-17

## Recent Changes

### VideoBlade Vision Defined (2025-11-17)

**Product Definition**:

- VideoBlade is a unified video management platform for multi-platform publishing
- Solves the problem of manually uploading the same video to multiple platforms (YouTube, Vimeo, TikTok, etc.)
- Core value: "Upload once, publish everywhere"
- Target users: Content creators who publish to 2+ video platforms

**Memory Bank Updated**:

- ✅ `projectbrief.md` - Updated with VideoBlade multi-platform publishing vision
- ✅ `productContext.md` - Detailed user flows, personas, and success metrics
- ✅ `systemPatterns.md` - Development principles added (DRY/SOLID, code quality first)
- ✅ `techContext.md` - Technology stack documented
- ✅ `activeContext.md` - This file, updated with new vision
- ⏳ `progress.md` - Next to update with specific VideoBlade features

### Project Setup (Pre-existing)

The project was initialized with `create-t3-app` (v7.40.0) and includes:

- ✅ Next.js 15 with App Router
- ✅ React 19
- ✅ TypeScript configuration
- ✅ tRPC API layer
- ✅ Prisma ORM with SQLite
- ✅ NextAuth.js authentication
- ✅ Tailwind CSS styling
- ✅ ESLint and Prettier
- ✅ Example post functionality

## Next Steps

### Immediate (Architecture & Planning)

1. ⏳ Update `progress.md` with VideoBlade-specific features
2. Design database schema for VideoBlade:
   - Platform connections (OAuth tokens)
   - Video storage references
   - Publish jobs queue
   - Publish history tracking
3. Create technical architecture document
4. Plan MVP implementation phases

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

**Next Action**: Update progress.md, then begin database schema design and MVP implementation.

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
2. **MCP servers available** - Use next-devtools, Context7, and Sentry (see `mcpServers.md`)
3. **Project is "VideoBlade"** - Multi-platform video publishing tool
4. **T3 Stack foundation is complete** - focus should be on video features
5. **SQLite is temporary** - production needs PostgreSQL
6. **Document new patterns** as they emerge during feature development
7. **Update Memory Bank** after significant changes or new learnings
