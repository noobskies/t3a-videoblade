# MCP Servers: t3a-videoblade

## Overview

This project has access to **Model Context Protocol (MCP) servers** that provide specialized tools and capabilities to enhance development workflow. MCP servers integrate directly with Cline, extending its abilities beyond standard file operations.

## Available MCP Servers

### 1. next-devtools

**Package**: `next-devtools-mcp@latest`  
**Type**: Next.js Development Tools  
**Status**: ✅ Enabled

#### What It Does

Provides runtime inspection and diagnostics for Next.js applications, with specific support for:

- Next.js 16+ runtime information
- Build diagnostics and error detection
- Route inspection and analysis
- Real-time dev server interaction
- MCP endpoint integration (automatic in Next.js 16+)

#### Key Capabilities

- **init**: Initialize Next.js DevTools context and fetch latest documentation
- **nextjs_docs**: Search and retrieve official Next.js documentation
- **nextjs_runtime**: Query running Next.js dev server for runtime information
- **browser_eval**: Automate browser testing with Playwright
- **upgrade_nextjs_16**: Guide through upgrading to Next.js 16
- **enable_cache_components**: Migrate to Cache Components mode

#### VideoBlade Use Cases

**Development**:

- Debug video upload flow issues in real-time
- Monitor tRPC procedure performance and timing
- Inspect React Server Component rendering behavior
- Troubleshoot OAuth callback flows (YouTube, Vimeo)
- Verify video metadata handling in server components

**Optimization**:

- Identify performance bottlenecks in upload processing
- Analyze API route response times
- Check for unnecessary re-renders during publish status updates
- Optimize server/client component boundaries

**Troubleshooting**:

- Debug route handling issues (platform connections, video library)
- Inspect build errors and warnings
- Verify environment variable configuration
- Check Next.js App Router behavior

**Testing**:

- Use browser automation to test upload UI
- Verify OAuth flows work end-to-end
- Test video library pagination and filtering
- Validate publish status real-time updates

### 2. Context7 (Upstash)

**Package**: `@upstash/context7-mcp@latest`  
**Type**: AI-Powered Documentation Retrieval  
**Status**: ✅ Enabled

#### What It Does

Provides instant access to up-to-date documentation for libraries and frameworks. Powered by Upstash's Context7 service, it delivers:

- Searchable documentation for popular libraries
- Code examples and patterns
- API reference materials
- Version-specific documentation

#### Key Capabilities

- **resolve-library-id**: Find the correct library identifier
- **get-library-docs**: Fetch comprehensive documentation with code examples
- Supports pagination for large documentation sets
- Topic-focused queries for specific features

#### VideoBlade Use Cases

**Platform API Integration**:

- Query YouTube Data API v3 documentation
- Learn Vimeo API upload patterns
- Understand TikTok Content Posting API
- Research platform-specific rate limits

**Queue & Background Jobs**:

- Get BullMQ documentation for job queue implementation
- Learn Redis patterns for job storage
- Understand queue retry strategies
- Research job scheduling patterns

**Cloud Storage**:

- Query Cloudflare R2 documentation
- Learn S3-compatible API patterns
- Understand presigned URL generation
- Research chunked upload strategies

**Database & ORM**:

- Get Prisma best practices
- Learn advanced query patterns
- Understand relation handling
- Research transaction patterns

**Authentication**:

- Query NextAuth.js 5.0 beta documentation
- Learn OAuth provider configuration
- Understand token refresh patterns
- Research session management strategies

**Examples**:

```
resolve-library-id("youtube data api")
get-library-docs("/googleapis/youtube", topic="video upload")

resolve-library-id("bullmq")
get-library-docs("/taskforcesh/bullmq", topic="job retry")

resolve-library-id("cloudflare r2")
get-library-docs("/cloudflare/workers-sdk", topic="r2 presigned urls")
```

### 3. Sentry

**Package**: `@sentry/mcp-server@latest`  
**Type**: Error Tracking & Monitoring  
**Status**: ✅ Enabled (Configured with access token)

#### What It Does

Provides direct integration with Sentry for error tracking, issue management, and production monitoring. Essential for:

- Real-time error tracking
- Issue investigation and debugging
- Performance monitoring
- Release tracking
- User impact analysis

#### Key Capabilities

- **whoami**: Identify authenticated user
- **find_organizations**: List accessible Sentry organizations
- **find_projects**: List projects in an organization
- **find_issues**: Search for issues (grouped errors)
- **search_issues**: Natural language issue search
- **search_events**: Query individual error events
- **get_issue_details**: Deep dive into specific issues
- **get_trace_details**: Trace distributed transactions
- **update_issue**: Resolve, assign, or modify issues
- **analyze_issue_with_seer**: AI-powered root cause analysis

#### Configuration

- **Host**: sentry.io
- **Access Token**: Configured (sntryu\_...)
- **OpenAI API Key**: Configured for AI analysis

#### VideoBlade Use Cases

**Video Upload Failures**:

- Track upload timeout errors
- Monitor storage API failures (R2, S3)
- Identify chunked upload issues
- Analyze file size validation errors

**Platform Publishing Errors**:

- Monitor YouTube API failures (quota exceeded, invalid credentials)
- Track Vimeo upload errors
- Catch OAuth token expiration issues
- Identify metadata validation failures

**Background Job Issues**:

- Track job queue failures
- Monitor job timeout errors
- Catch worker crashes
- Analyze retry patterns

**OAuth & Authentication**:

- Track OAuth callback failures
- Monitor token refresh issues
- Catch authentication errors
- Identify platform API authentication problems

**Performance Monitoring**:

- Track slow video upload requests
- Monitor API response times
- Identify performance bottlenecks
- Analyze queue processing duration

**Production Debugging**:

- Investigate production errors in real-time
- Use Seer AI for root cause analysis
- Track error patterns across platforms
- Monitor error rates by feature

**User Impact Analysis**:

- See how many users affected by upload failures
- Track platform-specific error rates
- Identify most critical issues
- Prioritize bug fixes based on impact

**Examples**:

```
# Find recent upload errors
search_issues("video upload failed")

# Get detailed error with stack trace
get_issue_details(issueUrl="https://sentry.io/issues/...")

# AI-powered root cause analysis
analyze_issue_with_seer(issueId="VIDEOBLADE-123")

# Track publish job failures
search_events("youtube publish failed last 24 hours")
```

## Integration with VideoBlade Development

### Development Phase

**next-devtools**:

- Primary tool for development
- Use for debugging and inspection
- Monitor performance during development
- Test features with browser automation

**Context7**:

- Research unfamiliar APIs
- Learn new library patterns
- Get code examples
- Understand best practices

### Testing Phase

**next-devtools**:

- Browser automation for E2E testing
- Verify all user flows work
- Test OAuth integrations
- Validate UI components

**Sentry** (Staging Environment):

- Set up error tracking before production
- Test error reporting integration
- Verify issue grouping works
- Configure alerts

### Production Phase

**Sentry**:

- Primary tool for production monitoring
- Real-time error alerting
- Issue investigation and resolution
- Performance monitoring
- User impact tracking

**Context7**:

- Quick reference for debugging
- Research when encountering new issues
- Learn about library updates

**next-devtools**:

- Occasional use for production debugging
- Analyze build outputs
- Verify optimizations

## Quick Reference

### When to Use Each Server

| Scenario              | Server        | Action                                    |
| --------------------- | ------------- | ----------------------------------------- |
| Debugging dev server  | next-devtools | `nextjs_runtime`                          |
| Need API docs         | Context7      | `resolve-library-id` + `get-library-docs` |
| Production error      | Sentry        | `search_issues` or `get_issue_details`    |
| Test upload UI        | next-devtools | `browser_eval` with Playwright            |
| Research BullMQ       | Context7      | Query BullMQ documentation                |
| Monitor failures      | Sentry        | `search_events` with filters              |
| OAuth not working     | next-devtools | Inspect runtime + browser testing         |
| Analyze error pattern | Sentry        | `analyze_issue_with_seer`                 |
| Next.js upgrade       | next-devtools | `upgrade_nextjs_16`                       |
| Learn new library     | Context7      | Search and read docs                      |

## Configuration Notes

### next-devtools

- No configuration required
- Works automatically with Next.js projects
- MCP enabled by default in Next.js 16+
- Dev server must be running for `nextjs_runtime` queries

### Context7

- No API key required
- Public documentation access
- Rate limits may apply
- Supports most popular libraries

### Sentry

- **Pre-configured** with access token
- OpenAI API key for Seer AI analysis
- Connected to sentry.io
- Ready for immediate use

**Important**: Sentry access token is project-specific. When setting up VideoBlade project in Sentry:

1. Create new project in Sentry
2. Get DSN for client-side error tracking
3. Update MCP settings if needed for different organization

## Best Practices

### Development Workflow

1. **Start Development**: Use next-devtools to verify setup
2. **Research Unfamiliar**: Query Context7 for documentation
3. **Hit Issues**: Check Sentry for similar past errors
4. **Debug Problems**: Use next-devtools runtime inspection
5. **Test Features**: Automate testing with browser_eval

### Production Monitoring

1. **Configure Sentry DSN** in VideoBlade for client errors
2. **Set up alerts** for critical errors (upload failures, publish failures)
3. **Monitor daily** for new issues
4. **Triage by impact** using user counts
5. **Use Seer AI** for complex error analysis

### Documentation Research

1. **Start broad**: `resolve-library-id` to find library
2. **Get focused**: Use topic parameter for specific features
3. **Paginate**: Check page 2-3 if context not sufficient
4. **Code examples**: Look for practical patterns in docs
5. **Stay updated**: Re-query docs when dependencies update

## Future MCP Servers to Consider

For VideoBlade development, these MCP servers could be valuable additions:

- **GitHub MCP**: Manage issues, PRs, and repository
- **Database MCP**: Direct database query and inspection
- **Redis MCP**: Monitor job queue in real-time
- **AWS S3 MCP**: Direct storage inspection (if using S3 instead of R2)
- **OpenAI MCP**: AI-powered code assistance

## Notes

- MCP servers run on-demand, not continuously
- Each server has timeout of 60 seconds
- Servers are globally configured (not project-specific)
- Access available through Cline interface
- Some tools require external services to be running (next-devtools needs dev server)
