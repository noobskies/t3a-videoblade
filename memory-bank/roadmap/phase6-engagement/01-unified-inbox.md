# Phase 6, Step 1: Unified Inbox Foundation

## Architecture: Sync-First Approach

To provide a reliable "Inbox Zero" workflow, we will **sync** comments to our database rather than fetching them purely in real-time. This allows us to:

1.  Track internal status (`OPEN`, `RESOLVED`).
2.  Provide instant UI load times.
3.  Search and filter locally.
4.  Avoid hitting API rate limits on every page load.

## Database Schema Changes

We need to store comments and their authors.

```prisma
model Comment {
  id            String   @id @default(cuid())
  platform      String   // "YOUTUBE", "LINKEDIN", etc.
  externalId    String   // ID on the platform
  content       String   @db.Text
  publishedAt   DateTime

  // Internal Status
  isResolved    Boolean  @default(false)
  isHidden      Boolean  @default(false)

  // Relationships
  platformConnectionId String
  platformConnection   PlatformConnection @relation(fields: [platformConnectionId], references: [id])

  authorId      String
  author        CommentAuthor @relation(fields: [authorId], references: [id])

  postId        String?  // Our internal Post ID if matched
  post          Post?    @relation(fields: [postId], references: [id])

  externalPostId String? // ID of the post on the platform (if we don't have it locally)

  // Threading
  parentId      String?
  parent        Comment? @relation("CommentThread", fields: [parentId], references: [id])
  replies       Comment[] @relation("CommentThread")

  @@unique([platform, externalId])
  @@index([platformConnectionId])
  @@index([isResolved])
}

model CommentAuthor {
  id            String   @id @default(cuid())
  platform      String
  externalId    String
  name          String
  avatarUrl     String?
  profileUrl    String?

  comments      Comment[]

  @@unique([platform, externalId])
}
```

## Implementation Steps

### 1. Database Setup

- [ ] Update `prisma/schema.prisma` with `Comment` and `CommentAuthor` models.
- [ ] Run migration.

### 2. API & Service Layer (`src/server/lib/comments/`)

- [ ] Create `CommentService` abstract class / interface.
- [ ] Implement `YouTubeCommentService` (using `googleapis`).
- [ ] Implement `LinkedInCommentService` (using `src/lib/linkedin.ts`).
- [ ] Implement `SyncService` to handle upsert logic.

### 3. Background Jobs (Inngest)

- [ ] Create `sync-comments` Inngest function.
- [ ] Configure cron trigger (e.g., every 10-15 minutes).
- [ ] Add manual "Sync Now" trigger.

### 4. Inbox UI (`/dashboard/inbox`)

- [ ] **Layout**: Sidebar (filters) + Main List + Detail View.
- [ ] **Component**: `CommentCard` showing author, content, time, source icon.
- [ ] **Action**: "Resolve" button (updates `isResolved` via tRPC).

### 5. tRPC Router

- [ ] `commentRouter.list`: Get comments with filters (platform, resolved status).
- [ ] `commentRouter.resolve`: Toggle resolved status.
- [ ] `commentRouter.sync`: Trigger manual sync.

## Platform Specifics (Initial Scope)

1.  **YouTube**:
    - Resource: `commentThreads.list`.
    - Map: `snippet.topLevelComment` -> Comment.
    - Sync: Poll recent videos? Or just channel-wide comments? (Channel-wide via `allThreadsRelatedToChannelId`).

2.  **LinkedIn**:
    - Resource: `socialActions` / `comments`.
    - LinkedIn API is stricter. Might need to iterate recent posts and fetch comments for each.
    - _Note_: Check API limits carefully.

## Future

- Webhook integration for real-time updates (where supported).
