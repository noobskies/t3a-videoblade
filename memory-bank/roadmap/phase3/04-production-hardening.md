# Phase 3, Step 4: Production Hardening

## Goal

Prepare VideoBlade for production traffic by implementing robust error tracking, rate limiting, and security hardening.

## Requirements

### 1. Sentry Integration

- **Install**: `@sentry/nextjs`.
- **Configure**:
  - Client-side error capturing.
  - Server-side (API/tRPC) error capturing.
  - Edge runtime support (if used).
  - Source maps uploading during build.

### 2. Rate Limiting

- **Tool**: Upstash Ratelimit + Redis (or Vercel KV).
- **Implementation**:
  - Middleware to protect `/api/upload` and `/api/trpc` routes.
  - Sliding window algorithm.
  - Limits:
    - Public API: Strict limits.
    - Authenticated users: Higher limits.
    - Upload endpoints: Burst limits.

### 3. Upload Hardening

- **Validation**: Ensure strict MIME type checking (Magic number check if possible, otherwise extension/header).
- **Size Limits**:
  - 5GB max for Video.
  - 10MB max for Image (future prep).
- **Security**: Ensure signed URLs expire quickly.

## Implementation Plan

### Step 1: Sentry Setup

1. Install dependencies: `npm install @sentry/nextjs`.
2. Run wizard: `npx @sentry/wizard@latest -i nextjs`.
3. Configure `sentry.server.config.ts`, `sentry.client.config.ts`, `sentry.edge.config.ts`.
4. Test with a deliberate error page.

### Step 2: Rate Limiting Setup

1. Install: `npm install @upstash/ratelimit @upstash/redis`.
2. Create `src/lib/ratelimit.ts` helper.
3. Add middleware or per-route checks in `src/server/api/trpc.ts`.
   - _Note_: Middleware in Next.js is global; tRPC middleware is per-procedure. Use tRPC middleware for finer control.

### Step 3: Final Security Check

1. Review `next.config.js` headers (CSP, HSTS).
2. Verify file upload restrictions.

## Success Criteria

- [ ] Sentry captures test error.
- [ ] Rate limiter blocks excessive requests (429).
- [ ] Uploads respect size limits.
