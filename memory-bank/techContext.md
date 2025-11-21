# Tech Context: t3a-videoblade

## Technology Stack

### Frontend

**React 19.0.0**

- Latest stable release with improved server components
- Concurrent rendering features
- Enhanced hydration
- Location: All `.tsx` files in `src/app/` and `src/app/_components/`

**Next.js 15.2.3**

- App Router architecture
- React Server Components
- **Loading & Suspense**: Leveraging `loading.tsx` and `Suspense` boundaries.
- **Lazy Loading**: Using `next/dynamic` for component-level splitting.
- Turbopack for development (via `--turbo` flag)
- Built-in optimization and code splitting
- Configuration: `next.config.js`

**TypeScript 5.8.2**

- Full type safety across the stack
- Strict mode enabled
- Configuration: `tsconfig.json`

**Material-UI v6 (MUI) - Active UI Framework**

- **Core**: `@mui/material`, `@emotion/react`, `@emotion/styled`
- **Integration**: `@mui/material-nextjs` for App Router cache
- **Icons**: `@mui/icons-material` (replaced Lucide)
- **Theming**: CSS Variables (`cssVariables: true`) + Native Dark Mode
- **Font**: `@fontsource/roboto` / `next/font/google` (Roboto)
- **Status**: **Primary Framework (Phase 1 Installed)**

**Data Visualization**

- **Recharts 3.4.1**
- Interactive charts for analytics dashboard
- Responsive and composable

**Tailwind CSS 4.0.15** [DEPRECATED - MIGRATING TO MUI]

- Utility-first styling
- Status: Being removed phase-by-phase. Still present until final cleanup.

**Lucide React** [REMOVED]

- Replaced by `@mui/icons-material`.

**shadcn/ui Components** [DEPRECATED - MIGRATING TO MUI]

- Status: Components exist but are being replaced by native MUI components.

### Backend

**tRPC 11.0.0**

- Type-safe API layer
- Client, server, and React Query integration
- **Suspense Mode**: Standardized on `useSuspenseQuery` for data fetching.
- SuperJSON transformer for advanced serialization
- Setup: `src/server/api/trpc.ts`

**Prisma 6.6.0**

- ORM for database access
- Client generation
- Migration management
- Schema: `prisma/schema.prisma`
- Generated client: `generated/prisma/`

**Better Auth 1.3.4+**

- Modern TypeScript-first authentication library
- Framework-agnostic design
- OAuth provider support with flexible scope configuration
- Session management with Prisma adapter
- Plugin ecosystem (2FA, passkeys, magic links)
- **Generic OAuth Plugin**: Used for Vimeo integration
- Configuration: `src/server/auth.ts`
- Client hooks: `src/lib/auth-client.ts`

**Sentry Configuration**:

- **SDK**: `@sentry/nextjs`
- **Features**:
  - **Error Tracking**: Client, Server, and Edge.
  - **Performance Tracing**: Automatic instrumentation.
  - **Session Replay**: Sampled at 10% (100% on error).
  - **Logs**: `enableLogs: true` and `consoleLoggingIntegration` enabled for deeper debugging.
- **Setup**: `sentry.*.config.ts` files and `next.config.js` wrapper.

**YouTube OAuth Scope Configuration**:

- **Scope**: `https://www.googleapis.com/auth/youtube` (full access)
- **Required for**: Smart Publish feature (update existing video metadata)

**Vimeo OAuth Configuration**:

- **Provider**: Custom Generic OAuth
- **Scopes**: `public`, `private`, `upload`, `edit`, `delete`, `stats`

### Database

**PostgreSQL** (Production & Development - Prisma Accelerate)

- Cloud-hosted PostgreSQL via Prisma
- Connection pooling and query caching with Prisma Accelerate
- Location: `db.prisma.io:5432`
- Configured with connection pooling for serverless environments
- Fully Migrated from SQLite
- **Core Models**: `Post` (Multi-format), `PlatformConnection`, `PublishJob`, `Comment` (Unified Inbox)

### Data Validation

**Zod 3.24.2**

- TypeScript-first schema validation
- Used in tRPC input validation
- Used in environment variable validation (`src/env.js`)

### Date Handling

**Dayjs 1.11.19**

- Lightweight date manipulation
- **Plugins**: `utc`, `timezone` used for Smart Queue logic.
- **Critical**: All scheduling logic relies on Dayjs timezone conversion to match user's local time preference with UTC storage.

### State Management

**TanStack Query 5.69.0** (React Query)

- Server state management
- Caching and synchronization
- Integrated with tRPC
- Configuration: `src/trpc/query-client.ts`

## Development Tools

### Code Quality

**ESLint 9.23.0**

- Next.js configuration
- TypeScript support
- Configuration: `eslint.config.js`
- Command: `npm run lint`, `npm run lint:fix`

**Prettier 3.5.3**

- Code formatting
- Configuration: `prettier.config.js`
- Commands: `npm run format:check`, `npm run format:write`

**TypeScript ESLint 8.27.0**

- TypeScript-specific linting rules
- Integrated with ESLint

### Build Tools

**Turbopack** (Next.js 15)

- Fast development bundler
- Enabled via `npm run dev --turbo`
- Faster than Webpack for development

**PostCSS 8.5.3**

- CSS processing
- Tailwind CSS integration (Legacy support during migration)
- Configuration: `postcss.config.js`

## MCP Servers (Development Tools)

This project has access to **Model Context Protocol (MCP) servers** that extend Cline's development capabilities beyond standard file operations.

### Available Servers

**next-devtools** (`next-devtools-mcp@latest`)

- Next.js-specific debugging and runtime inspection
- Browser automation with Playwright
- Dev server interaction and diagnostics
- Perfect for debugging VideoBlade's Next.js application

**Context7** (`@upstash/context7-mcp@latest`)

- AI-powered documentation retrieval for libraries
- Instant access to API references and code examples
- Essential for learning YouTube API, BullMQ, Cloudflare R2, etc.

**Sentry** (`@sentry/mcp-server@latest`)

- Error tracking and production monitoring
- Pre-configured with access token
- AI-powered root cause analysis with Seer
- Critical for VideoBlade production debugging

## Development Setup

### Prerequisites

- Node.js 20+ (specified in `@types/node`)
- npm 11.5.1 (specified in `package.json`)

### Environment Variables

**Required in `.env`**:

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Better Auth
BETTER_AUTH_SECRET="your-secret-here"
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth (for YouTube API access)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# TikTok OAuth
TIKTOK_CLIENT_KEY="your-tiktok-client-key"
TIKTOK_CLIENT_SECRET="your-tiktok-client-secret"

# Vimeo OAuth
VIMEO_CLIENT_ID="your-vimeo-client-id"
VIMEO_CLIENT_SECRET="your-vimeo-client-secret"

# Optional: Public Better Auth URL (for client-side)
# NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
```

**Validation**: `src/env.js` validates all environment variables using Zod

**Generate Secret**:

```bash
openssl rand -base64 32
```

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run postinstall

# Initialize database
npm run db:push
```

### Running the Project

**Development**:

```bash
npm run dev              # Start dev server (with Turbopack)
npm run dev --turbo      # Explicit Turbopack flag
```

**Production**:

```bash
npm run build            # Build for production
npm run start            # Start production server
npm run preview          # Build and start (combined)
```

**Database**:

```bash
npm run db:generate      # Create migration (dev)
npm run db:migrate       # Run migrations (production)
npm run db:push          # Push schema without migration
npm run db:studio        # Open Prisma Studio GUI
```

**Code Quality**:

```bash
npm run check            # Run lint + typecheck
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run typecheck        # Run TypeScript compiler check
npm run format:check     # Check Prettier formatting
npm run format:write     # Fix Prettier formatting
```

## Project Structure

```
t3a-videoblade/
├── prisma/
│   └── schema.prisma           # Database schema
├── generated/
│   └── prisma/                 # Generated Prisma client
├── public/
│   └── favicon.ico             # Static assets
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout (Providers: MUI + tRPC)
│   │   ├── page.tsx            # Homepage
│   │   ├── _components/        # Private components
│   │   │   ├── post.tsx        # Post component
│   │   │   └── auth-button.tsx # Auth button
│   │   └── api/
│   │       ├── auth/[...all]/  # Better Auth routes
│   │       └── trpc/           # tRPC API handler
│   ├── theme.ts                # MUI Theme Configuration
│   ├── server/
│   │   ├── auth.ts             # Better Auth config
│   │   ├── api/
│   │   │   ├── root.ts         # Root tRPC router
│   │   │   ├── trpc.ts         # tRPC setup
│   │   │   └── routers/        # API routers
│   │   └── db.ts               # Prisma client
│   ├── trpc/
│   │   ├── react.tsx           # Client tRPC
│   │   ├── server.ts           # Server tRPC
│   │   └── query-client.ts     # React Query config
│   ├── lib/
│   │   ├── utils.ts            # Utility functions
│   │   ├── auth-client.ts      # Better Auth client
│   ├── styles/
│   │   └── globals.css         # Global styles
│   └── env.js                  # Environment validation
├── .env                        # Environment variables (gitignored)
├── .env.example                # Example environment
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── next.config.js              # Next.js config
├── eslint.config.js            # ESLint config
├── prettier.config.js          # Prettier config
├── postcss.config.js           # PostCSS config
├── components.json             # shadcn/ui config (if used)
└── memory-bank/                # Cline's memory
```

## Dependencies Overview

### Production Dependencies

**Core Framework**: Next.js, React, TypeScript
**UI Framework**: **Material-UI v6** (Core, Icons, Emotion)
**API & Data**: tRPC, TanStack Query, Prisma, Better Auth, Google APIs, **Upstash Ratelimit**
**Storage**: AWS SDK (S3)
**Background Jobs**: Inngest
**Validation**: Zod, SuperJSON
**Observability**: **Sentry** (Error Tracking & Performance)

### Legacy Dependencies (To Be Removed)

- `tailwindcss`
- `class-variance-authority`
- `clsx`
- `tailwind-merge`
- `lucide-react` (Already removed)

### Development Dependencies

- TypeScript, ESLint, Prettier
- PostCSS (for legacy Tailwind support)
- Prisma CLI
