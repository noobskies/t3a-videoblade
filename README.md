# VideoBlade

**Multi-Platform Video Publishing Tool**

> Upload once, publish everywhere.

VideoBlade is a unified video management platform that enables content creators to publish videos to multiple platforms simultaneously. Say goodbye to manual uploads and hello to streamlined video distribution.

## Overview

Content creators today spend 1-2 hours manually uploading the same video to YouTube, Vimeo, TikTok, and other platforms. VideoBlade reduces this to 10-15 minutes by automating the entire distribution process.

### Core Value Proposition

- **Time Savings**: Reduce publishing time by 70%+ across multiple platforms
- **Consistency**: Ensure videos are published correctly everywhere
- **Automation**: Queue-based background processing handles the heavy lifting
- **Unified Dashboard**: Monitor all platforms from a single interface

### Target Users

Content creators who publish the same video to 2+ platforms:

- Educational content creators
- Marketing teams
- Indie filmmakers
- Podcasters with video content

## Features

### Planned Features

- ✅ **Multi-Platform Support**: YouTube, Vimeo, TikTok, and more
- ✅ **Batch Publishing**: Configure once, publish to all platforms simultaneously
- ✅ **Scheduling**: Queue videos for future release with platform-specific timing
- ✅ **Unified Dashboard**: Monitor publish status across all platforms
- ✅ **OAuth Integration**: Secure platform authentication
- ✅ **Background Processing**: Reliable job queue with retry logic

### Current Status

- ✅ **Foundation Complete**: T3 Stack configured and operational
- ✅ **Vision Documented**: Comprehensive project documentation
- ⏳ **Phase 1 - MVP**: YouTube-only integration (in planning)
- ⏳ **Phase 2**: Multi-platform support
- ⏳ **Phase 3**: Scheduling and polish
- ⏳ **Phase 4**: Production ready

See [`memory-bank/progress.md`](./memory-bank/progress.md) for detailed implementation status.

## Tech Stack

Built on the [T3 Stack](https://create.t3.gg/) for end-to-end type safety and developer experience:

### Core Framework

- **[Next.js 15](https://nextjs.org)** - React framework with App Router
- **[React 19](https://react.dev)** - UI library with server components
- **[TypeScript 5.8](https://www.typescriptlang.org)** - Type-safe development

### API & Data

- **[tRPC 11](https://trpc.io)** - End-to-end type-safe API
- **[Prisma 6](https://prisma.io)** - Type-safe database ORM
- **[NextAuth.js 5](https://next-auth.js.org)** - Authentication with OAuth
- **[TanStack Query](https://tanstack.com/query)** - Server state management

### UI & Styling

- **[Tailwind CSS 4](https://tailwindcss.com)** - Utility-first styling
- **[Lucide Icons](https://lucide.dev)** - Icon library
- **[Radix UI](https://www.radix-ui.com/)** - Headless UI components (planned)

### Infrastructure (Planned)

- **[BullMQ](https://docs.bullmq.io/)** - Background job queue
- **[Redis](https://redis.io/)** - Queue storage and caching
- **[Cloudflare R2](https://www.cloudflare.com/products/r2/)** - Video file storage
- **[PostgreSQL](https://www.postgresql.org/)** - Production database

## Getting Started

### Prerequisites

- Node.js 20+
- npm 11.5.1+
- Git

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/noobskies/t3a-videoblade.git
cd t3a-videoblade
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

Generate a secure secret:

```bash
openssl rand -base64 32
```

4. **Initialize the database**

```bash
npm run db:push
```

5. **Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Management

```bash
npm run db:studio    # Open Prisma Studio GUI
npm run db:push      # Push schema changes (dev)
npm run db:generate  # Generate migration (prod)
```

## Project Structure

```
t3a-videoblade/
├── memory-bank/          # AI context persistence (see below)
├── prisma/               # Database schema
├── src/
│   ├── app/             # Next.js App Router pages
│   ├── server/          # Server-side code
│   │   ├── api/         # tRPC routers
│   │   └── auth/        # NextAuth configuration
│   ├── trpc/            # tRPC client setup
│   └── styles/          # Global styles
├── public/              # Static assets
└── generated/           # Generated Prisma client
```

## Memory Bank

This project uses a **Memory Bank** for AI-assisted development and context persistence.

### What is the Memory Bank?

The Memory Bank is a collection of comprehensive documentation files in the `memory-bank/` directory that maintain project context across development sessions. These files enable AI assistants (like Cline) to quickly understand the project after memory resets.

### Available Documents

- **[`projectbrief.md`](./memory-bank/projectbrief.md)** - Project scope, requirements, and success criteria
- **[`productContext.md`](./memory-bank/productContext.md)** - User flows, personas, and UX goals
- **[`systemPatterns.md`](./memory-bank/systemPatterns.md)** - Architecture, design patterns, and development principles
- **[`techContext.md`](./memory-bank/techContext.md)** - Technology stack details and setup instructions
- **[`activeContext.md`](./memory-bank/activeContext.md)** - Current work focus and next steps
- **[`progress.md`](./memory-bank/progress.md)** - Implementation status and roadmap
- **[`mcpServers.md`](./memory-bank/mcpServers.md)** - Available MCP development tools

### For Developers

**Before starting work**: Read ALL Memory Bank files to understand the current project state, architecture decisions, and development patterns.

**After significant changes**: Update relevant Memory Bank files to maintain accurate documentation.

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run build            # Build for production
npm run start            # Start production server
npm run preview          # Build and start

# Database
npm run db:push          # Push schema changes (dev)
npm run db:generate      # Create migration
npm run db:migrate       # Run migrations (prod)
npm run db:studio        # Open Prisma Studio

# Code Quality
npm run check            # Run lint + typecheck
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run typecheck        # Run TypeScript checks
npm run format:check     # Check Prettier formatting
npm run format:write     # Fix Prettier formatting
```

### Development Principles

This project follows **strict development principles** documented in [`memory-bank/systemPatterns.md`](./memory-bank/systemPatterns.md):

**Critical: Code Quality Over Backwards Compatibility**

- Always follow DRY (Don't Repeat Yourself) and SOLID principles
- Prioritize correct, maintainable code architecture
- Do NOT compromise code quality for backwards compatibility
- Refactor and restructure code properly when needed
- Break things if necessary to implement the right solution

### MCP Servers

VideoBlade has access to powerful development tools via MCP (Model Context Protocol):

- **next-devtools**: Next.js debugging and browser automation
- **Context7**: AI-powered documentation retrieval for libraries
- **Sentry**: Error tracking and monitoring

See [`memory-bank/mcpServers.md`](./memory-bank/mcpServers.md) for detailed usage.

## Roadmap

### Phase 1: MVP - YouTube Only (2-3 weeks)

- [ ] Database schema for videos and platform connections
- [ ] YouTube OAuth integration
- [ ] Video upload to Cloudflare R2
- [ ] Background job queue with BullMQ
- [ ] YouTube API publishing
- [ ] Basic UI (upload, connect, publish)

### Phase 2: Multi-Platform Support (3-4 weeks)

- [ ] Vimeo integration
- [ ] Platform-specific metadata handling
- [ ] Batch publishing UI
- [ ] Publish history tracking
- [ ] Retry logic for failures

### Phase 3: Scheduling & Polish (2-3 weeks)

- [ ] Job scheduling system
- [ ] Scheduling UI
- [ ] Notifications (email/in-app)
- [ ] UI/UX polish
- [ ] Comprehensive error handling

### Phase 4: Production Ready (1-2 weeks)

- [ ] Performance optimization
- [ ] Testing suite
- [ ] Production deployment (Vercel)
- [ ] PostgreSQL migration
- [ ] Monitoring and error tracking

## Contributing

### Development Guidelines

1. **Read the Memory Bank** - Understand the project before making changes
2. **Follow DRY/SOLID** - See development principles above
3. **Type Safety** - Leverage TypeScript fully, no `any` without justification
4. **Test Locally** - Verify changes work before committing
5. **Update Documentation** - Keep Memory Bank files current

### Commit Messages

Follow conventional commit format:

```
feat: add YouTube OAuth integration
fix: resolve video upload timeout
docs: update Memory Bank with new patterns
refactor: extract platform API logic
```

## License

[MIT](./LICENSE) - See LICENSE file for details.

## Acknowledgments

- Built with [T3 Stack](https://create.t3.gg/)
- Bootstrapped with [`create-t3-app`](https://github.com/t3-oss/create-t3-app)

---

**Status**: Foundation complete, ready for MVP development  
**Documentation**: See [`memory-bank/`](./memory-bank/) directory  
**Progress**: 28% (Foundation + Documentation complete)
