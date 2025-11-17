# System Patterns: t3a-videoblade

## Architecture Overview

This project follows the **T3 Stack** architecture, emphasizing type safety and developer experience across the entire stack.

```
┌─────────────────────────────────────────┐
│          Client (Browser)               │
│  ┌──────────────────────────────────┐  │
│  │    React 19 Components           │  │
│  │    (Server & Client Components)  │  │
│  └──────────────────────────────────┘  │
└─────────────────┬───────────────────────┘
                  │ tRPC Client
                  │ (Type-safe calls)
┌─────────────────▼───────────────────────┐
│        Next.js 15 Server (App Router)   │
│  ┌──────────────────────────────────┐  │
│  │   tRPC API Routes                │  │
│  │   - Routers & Procedures         │  │
│  │   - Middleware (auth, timing)    │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │   NextAuth.js                    │  │
│  │   - Session management           │  │
│  │   - OAuth providers              │  │
│  └──────────────────────────────────┘  │
└─────────────────┬───────────────────────┘
                  │ Prisma Client
                  │ (Type-safe queries)
┌─────────────────▼───────────────────────┐
│         Database (SQLite)                │
│  - Users, Accounts, Sessions            │
│  - Posts                                │
│  - Verification Tokens                  │
└─────────────────────────────────────────┘
```

## Development Principles

**CRITICAL: Code Quality Over Backwards Compatibility**

These principles guide all development decisions and patterns in this project:

### 1. Code Quality First

- **Never compromise code quality for backwards compatibility**
- Refactor and restructure code properly when needed
- Break things if necessary to implement the right solution
- Technical debt should be addressed immediately, not accumulated

### 2. DRY (Don't Repeat Yourself)

- Extract common logic into reusable functions/components
- Use abstraction to eliminate duplication
- Single source of truth for business logic
- Shared utilities in `src/lib/`

### 3. SOLID Principles

**Single Responsibility**: Each function/component does one thing well

- tRPC procedures handle one operation
- Components have a single purpose
- Utilities are focused and specific

**Open/Closed**: Open for extension, closed for modification

- Use composition over modification
- Extend behavior through props/parameters
- Type-safe extension points

**Liskov Substitution**: Subtypes must be substitutable

- Consistent interfaces across similar components
- Type safety ensures substitutability
- Predictable behavior

**Interface Segregation**: Prefer specific interfaces

- Component props are specific to needs
- No bloated interfaces with unused properties
- tRPC procedures have focused inputs

**Dependency Inversion**: Depend on abstractions

- Use dependency injection patterns
- Context for shared dependencies
- Avoid tight coupling

### 4. Maintainability Standards

- **Clear over clever**: Readable code is better than "smart" code
- **Type safety**: Leverage TypeScript fully, no `any` without justification
- **Proper abstractions**: Create abstractions when patterns emerge, not prematurely
- **Refactor freely**: If code needs restructuring, do it right away
- **Test thoroughly**: When adding tests, cover edge cases

### 5. When to Break Things

It's **acceptable and encouraged** to break backwards compatibility when:

- Current implementation violates SOLID principles
- Code duplication can be eliminated
- Better architecture pattern is discovered
- Type safety can be improved
- Technical debt is significant

**Process for Breaking Changes**:

1. Identify the problem with current implementation
2. Design the correct solution
3. Implement the new approach properly
4. Update all affected code
5. Document the change in Memory Bank

### 6. Architecture Evolution

- **Iterate toward better design**: Start simple, refactor as patterns emerge
- **No sacred cows**: Any code can be rewritten if there's a better way
- **Document decisions**: Record why choices were made in Memory Bank
- **Learn and adapt**: Update patterns based on what works

## Key Technical Decisions

### 1. Next.js App Router (Not Pages Router)

**Decision**: Use App Router with React Server Components

**Rationale**:

- Better performance with server components
- Improved data fetching patterns
- Streaming and Suspense support
- Future-proof architecture

**Implications**:

- Components default to server components
- Use `"use client"` directive sparingly
- Async components for data fetching
- Different file conventions (layout.tsx, page.tsx)

### 2. tRPC for API Layer

**Decision**: tRPC instead of REST or GraphQL

**Rationale**:

- Full type safety without code generation
- Automatic API documentation via types
- Reduced boilerplate
- Direct function calls from client

**Implementation**:

- Routers in `src/server/api/routers/`
- Context includes session and database
- Public and protected procedures
- SuperJSON for advanced serialization

### 3. Prisma ORM

**Decision**: Prisma for database access

**Rationale**:

- Type-safe database queries
- Migration management
- Prisma Studio for database inspection
- Great TypeScript integration

**Schema Location**: `prisma/schema.prisma`
**Generated Client**: `generated/prisma/`

### 4. SQLite for Development

**Decision**: SQLite with plan to migrate for production

**Rationale**:

- Zero configuration for development
- File-based, easy to reset
- Good for prototyping

**Production Consideration**: Will need PostgreSQL or MySQL

## Design Patterns in Use

### tRPC Router Pattern

**Location**: `src/server/api/routers/`

```typescript
// Pattern: Define procedures with input validation
export const postRouter = createTRPCRouter({
  // Query (read operation)
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return { greeting: `Hello ${input.text}` };
    }),

  // Mutation (write operation)
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.create({
        data: {
          name: input.name,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),
});
```

**Key Points**:

- Use `publicProcedure` for unauthenticated endpoints
- Use `protectedProcedure` for authenticated endpoints
- Input validation with Zod
- Context (`ctx`) provides database and session

### Server Component Data Fetching

**Location**: `src/app/page.tsx`

```typescript
// Pattern: Direct tRPC calls in server components
export default async function Page() {
  const data = await api.post.hello({ text: "from server" });
  return <div>{data.greeting}</div>;
}
```

**Key Points**:

- Async server components
- Direct API calls (no HTTP)
- Automatic type inference

### Client Component tRPC Usage

**Pattern**: Use React Query hooks

```typescript
"use client";
import { api } from "@/trpc/react";

export function Component() {
  const { data } = api.post.hello.useQuery({ text: "from client" });
  return <div>{data?.greeting}</div>;
}
```

### Authentication Middleware Pattern

**Location**: `src/server/api/trpc.ts`

Protected procedures automatically check authentication:

```typescript
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });
```

**Benefits**:

- Automatic authentication checking
- Type-safe session in protected procedures
- Consistent error handling

## Component Relationships

### Application Structure

```
src/app/
├── layout.tsx          # Root layout (providers, fonts)
├── page.tsx            # Homepage (server component)
└── _components/
    └── post.tsx        # Latest post component (client)

src/server/
├── auth/
│   ├── config.ts       # NextAuth configuration
│   └── index.ts        # Auth helpers
├── api/
│   ├── root.ts         # Root tRPC router
│   ├── trpc.ts         # tRPC setup & procedures
│   └── routers/
│       └── post.ts     # Post router
└── db.ts               # Prisma client singleton

src/trpc/
├── react.tsx           # Client-side tRPC setup
├── server.ts           # Server-side tRPC setup
└── query-client.ts     # React Query config
```

### Data Flow Pattern

1. **Server Component → tRPC → Database**:

   ```
   page.tsx → api.post.hello() → postRouter.hello → Return data
   ```

2. **Client Component → tRPC → API Route → Database**:

   ```
   post.tsx → useQuery() → HTTP request → /api/trpc → postRouter → Database
   ```

3. **Authentication Check**:
   ```
   Request → createTRPCContext → auth() → Session in context
   ```

## Critical Implementation Paths

### Path 1: Adding a New tRPC Procedure

1. Create/modify router in `src/server/api/routers/`
2. Add router to root router in `src/server/api/root.ts`
3. Use in component:
   - Server: `await api.routerName.procedureName(input)`
   - Client: `api.routerName.procedureName.useQuery(input)`

### Path 2: Adding Database Model

1. Edit `prisma/schema.prisma`
2. Run `npm run db:push` (dev) or `npm run db:generate` (create migration)
3. Use via `ctx.db.modelName` in tRPC procedures

### Path 3: Authentication Flow

1. **Sign In**: User clicks sign-in → `/api/auth/signin` → NextAuth → Create session
2. **Access Protected Route**: Request → `auth()` → Check session → Grant/deny access
3. **tRPC Protected Call**: Request → `protectedProcedure` → Verify session → Execute

### Path 4: Environment Variables

**Location**: `.env`

**Required Variables**:

- `DATABASE_URL`: Prisma database connection
- `NEXTAUTH_SECRET`: Session encryption key
- `NEXTAUTH_URL`: Application URL

**Pattern**: Validated in `src/env.js` using Zod

## State Management

### Server State (Database)

- Managed by Prisma
- Accessed via tRPC procedures
- React Query caching on client

### Client State

- React Query for server data
- React hooks for local UI state
- No global state management needed yet

### Session State

- NextAuth.js manages sessions
- Available in `ctx.session` in tRPC
- Available via `auth()` in server components

## Error Handling

### tRPC Errors

```typescript
throw new TRPCError({
  code: "UNAUTHORIZED" | "BAD_REQUEST" | "INTERNAL_SERVER_ERROR",
  message: "Optional custom message",
});
```

### Zod Validation Errors

Automatically formatted and returned to client with field-level details.

### Database Errors

Caught by Prisma, can be handled in procedure:

```typescript
try {
  await ctx.db.post.create({ data });
} catch (error) {
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Failed to create post",
  });
}
```

## Performance Patterns

### React Query Prefetching

```typescript
// In server component
if (condition) {
  void api.post.getLatest.prefetch();
}

return (
  <HydrateClient>
    {/* Client component can access cached data */}
    <ComponentThatUsesData />
  </HydrateClient>
);
```

### Timing Middleware

Development mode adds artificial delay (100-500ms) to simulate network latency and catch waterfall issues.

## Testing Considerations

### Current Testing Setup

- ESLint for code quality
- TypeScript for type checking
- Prettier for formatting

### Future Testing Paths

- Unit tests: Vitest or Jest
- E2E tests: Playwright
- API tests: Direct tRPC procedure calls
- Database tests: Test database with Prisma

## Conventions

### File Naming

- Server components: `page.tsx`, `layout.tsx`
- Client components: Use `"use client"` directive
- Private components: `_components/` directory
- API routes: `route.ts`

### Import Aliases

- `@/`: Maps to `src/`
- Example: `import { api } from "@/trpc/server"`

### Code Style

- TypeScript strict mode
- ESLint with Next.js config
- Prettier formatting
- No semicolons (Prettier default)
