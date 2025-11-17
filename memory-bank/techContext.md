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
- Turbopack for development (via `--turbo` flag)
- Built-in optimization and code splitting
- Configuration: `next.config.js`

**TypeScript 5.8.2**

- Full type safety across the stack
- Strict mode enabled
- Configuration: `tsconfig.json`

**Tailwind CSS 4.0.15**

- Utility-first styling
- PostCSS integration
- Custom configuration in `postcss.config.js`
- Global styles: `src/styles/globals.css`

**Lucide React 0.554.0**

- Icon library
- Tree-shakeable icons
- Used for UI elements

### Backend

**tRPC 11.0.0**

- Type-safe API layer
- Client, server, and React Query integration
- SuperJSON transformer for advanced serialization
- Setup: `src/server/api/trpc.ts`

**Prisma 6.6.0**

- ORM for database access
- Client generation
- Migration management
- Schema: `prisma/schema.prisma`
- Generated client: `generated/prisma/`

**NextAuth.js 5.0.0-beta.25**

- Authentication library
- OAuth provider support
- Session management
- Prisma adapter integration
- Configuration: `src/server/auth/config.ts`

### Database

**SQLite** (Development)

- File-based database
- Zero configuration
- Location: `prisma/dev.db` (gitignored)
- Connection string in `.env`

**Future**: PostgreSQL or MySQL for production

### Data Validation

**Zod 3.24.2**

- TypeScript-first schema validation
- Used in tRPC input validation
- Used in environment variable validation (`src/env.js`)

### State Management

**TanStack Query 5.69.0** (React Query)

- Server state management
- Caching and synchronization
- Integrated with tRPC
- Configuration: `src/trpc/query-client.ts`

### Utilities

**class-variance-authority 0.7.1** - Component variant styling  
**clsx 2.1.1** - Conditional classNames  
**tailwind-merge 3.4.0** - Merge Tailwind classes intelligently  
**server-only 0.0.1** - Enforce server-only code

## Development Tools

### Code Quality

**ESLint 9.23.0**

- Next.js configuration
- TypeScript support
- Configuration: `eslint.config.js`
- Command: `npm run lint`, `npm run lint:fix`

**Prettier 3.5.3**

- Code formatting
- Tailwind CSS plugin for class sorting
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
- Tailwind CSS integration
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

### When to Use MCP Servers

**During Development**:

- Use `next-devtools` for debugging video upload flows and OAuth integrations
- Query `Context7` for platform API documentation (YouTube, Vimeo)
- Check `Sentry` for similar past errors before implementing new features

**For Testing**:

- Browser automation via `next-devtools` to test upload UI
- Verify OAuth flows end-to-end

**In Production**:

- Monitor errors in real-time with `Sentry`
- Use AI analysis for complex production issues

**See [`memory-bank/mcpServers.md`](./mcpServers.md) for comprehensive documentation, VideoBlade-specific use cases, and detailed usage examples.**

## Development Setup

### Prerequisites

- Node.js 20+ (specified in `@types/node`)
- npm 11.5.1 (specified in `package.json`)

### Environment Variables

**Required in `.env`**:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (optional)
# DISCORD_CLIENT_ID=""
# DISCORD_CLIENT_SECRET=""
```

**Validation**: `src/env.js` validates all environment variables using Zod

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
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Homepage
│   │   ├── _components/        # Private components
│   │   └── api/
│   │       ├── auth/           # NextAuth.js routes
│   │       └── trpc/           # tRPC API handler
│   ├── server/
│   │   ├── auth/               # Authentication config
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
│   │   └── utils.ts            # Utility functions
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

## Technical Constraints

### Hard Constraints

1. **TypeScript Required**: All code must be TypeScript
2. **Type Safety**: No `any` types without justification
3. **ESLint Compliance**: Code must pass linting
4. **SQLite for Dev**: Database is file-based in development
5. **Server Components Default**: Components are server-rendered unless marked `"use client"`

### Soft Constraints

1. **Prettier Formatting**: Code should be formatted
2. **No Semicolons**: Prettier config removes them
3. **Import Aliases**: Use `@/` prefix for imports from `src/`
4. **Environment Validation**: All env vars must be in `src/env.js`

## Dependencies Overview

### Production Dependencies (22 packages)

**Core Framework** (6):

- next, react, react-dom
- @t3-oss/env-nextjs, server-only
- typescript

**API & Data** (7):

- @trpc/client, @trpc/server, @trpc/react-query
- @tanstack/react-query
- @prisma/client, @auth/prisma-adapter
- next-auth

**Validation & Utilities** (5):

- zod, superjson
- clsx, class-variance-authority, tailwind-merge

**UI** (4):

- lucide-react
- tailwindcss (via PostCSS)

### Development Dependencies (13 packages)

**TypeScript** (3):

- typescript, @types/node, @types/react, @types/react-dom

**Linting** (4):

- eslint, eslint-config-next, @eslint/eslintrc, typescript-eslint

**Formatting** (2):

- prettier, prettier-plugin-tailwindcss

**Build Tools** (3):

- postcss, @tailwindcss/postcss, tw-animate-css

**Database** (1):

- prisma

## Tool Usage Patterns

### Adding a New Dependency

```bash
# Production dependency
npm install package-name

# Development dependency
npm install -D package-name

# Update lock file
npm install
```

### Database Workflow

**Development**:

1. Edit `prisma/schema.prisma`
2. Run `npm run db:push` (quick, no migration)
3. Test changes
4. When ready for production, use `npm run db:generate`

**Production**:

1. Create proper migrations with `npm run db:generate`
2. Commit migration files
3. Deploy and run `npm run db:migrate`

### Type Generation

**Prisma**: Runs automatically on `npm install` (postinstall script)

**Manual**:

```bash
npx prisma generate
```

### Debugging

**Database**:

```bash
npm run db:studio  # Visual database editor
```

**Network**: Next.js dev tools in browser  
**tRPC**: Console logs with timing middleware  
**React**: React DevTools browser extension

## Known Technical Issues

### NextAuth.js Beta

- Using beta version (5.0.0-beta.25)
- API may change before stable release
- Some providers may have incomplete documentation

### SQLite Limitations

- Not suitable for production
- No concurrent writes support
- Limited data types compared to PostgreSQL

### Prisma Generated Client Location

- Custom output path: `generated/prisma/`
- Must be in `.gitignore`
- Regenerated on every `npm install`

## Future Technical Considerations

### For Video Features

**Potential Libraries**:

- `@ffmpeg/ffmpeg` - Client-side video processing
- `videojs` or `plyr` - Video player components
- `aws-sdk` - S3 integration for storage
- `sharp` - Thumbnail generation
- `fluent-ffmpeg` - Server-side video processing

**Infrastructure Needs**:

- Cloud storage (S3, R2, etc.)
- CDN for video delivery
- Transcoding service
- Webhook handling for async processing

### Database Migration

**For Production**:

- Switch from SQLite to PostgreSQL
- Update `schema.prisma` provider
- Update `DATABASE_URL` format
- May need to uncomment `@db.Text` annotations in schema

### Deployment Platforms

**Recommended**:

- Vercel (optimal for Next.js)
- Railway (includes PostgreSQL)
- Fly.io
- AWS/GCP/Azure

**Requirements**:

- Node.js 20+ runtime
- PostgreSQL database
- Environment variables configured
- Build command: `npm run build`
- Start command: `npm run start`
