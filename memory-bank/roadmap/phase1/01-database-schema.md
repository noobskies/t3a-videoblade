# Phase 1: Database Schema Design

## Goal

Design and implement database models for videos, platform connections, and publish jobs.

**Estimated Time**: 2-3 hours

---

## Prerequisites

- [x] Phase 0: Prerequisites complete
- [x] Prisma installed and configured
- [x] Database connection working

---

## Database Schema Overview

We need 4 main models for MVP:

1. **Video** - Stores uploaded videos and metadata
2. **Platform** - Enum of supported platforms (YouTube, Rumble)
3. **PlatformConnection** - User's connected platform accounts (OAuth tokens)
4. **PublishJob** - Queue entries for publishing videos to platforms

**Relationships**:

```
User (existing)
├── videos (1:many) → Video
├── platformConnections (1:many) → PlatformConnection
└── publishJobs (1:many) → PublishJob

Video
├── createdBy → User
└── publishJobs (1:many) → PublishJob

PlatformConnection
├── user → User
└── publishJobs (1:many) → PublishJob

PublishJob
├── video → Video
├── platformConnection → PlatformConnection
└── createdBy → User
```

---

## Tasks

### 1. Update Prisma Schema

Edit `prisma/schema.prisma`:

```prisma
// ... existing generator and datasource ...

// Platform enum
enum Platform {
  YOUTUBE
  RUMBLE
}

// Publish job status
enum PublishStatus {
  PENDING    // Job created, not yet processing
  PROCESSING // Currently uploading/publishing
  COMPLETED  // Successfully published
  FAILED     // Failed to publish
  CANCELLED  // User cancelled
}

// Video privacy settings
enum VideoPrivacy {
  PUBLIC
  UNLISTED
  PRIVATE
}

// ... existing User, Account, Session models ...

model Video {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // S3 Storage
  s3Key       String  // S3 object key (path in bucket)
  s3Bucket    String  // Bucket name
  fileName    String  // Original filename
  fileSize    BigInt  // File size in bytes
  mimeType    String  // e.g., "video/mp4"
  duration    Int?    // Duration in seconds (optional)

  // Metadata
  title        String
  description  String? @db.Text
  tags         String? // Comma-separated tags
  thumbnailUrl String? // URL to thumbnail image
  privacy      VideoPrivacy @default(UNLISTED)

  // Relationships
  createdBy   User   @relation(fields: [createdById], references: [id], onDelete: Cascade)
  createdById String

  publishJobs PublishJob[]

  @@index([createdById])
  @@index([createdAt])
}

model PlatformConnection {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Platform info
  platform         Platform
  platformUserId   String  // User's ID on the platform
  platformUsername String? // Display name on platform

  // OAuth tokens
  accessToken  String  @db.Text
  refreshToken String? @db.Text
  tokenExpiry  DateTime?

  // Platform-specific data (JSON)
  metadata Json?

  // Status
  isActive Boolean @default(true)

  // Relationships
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String

  publishJobs PublishJob[]

  // One connection per platform per user
  @@unique([userId, platform])
  @@index([userId])
  @@index([platform])
}

model PublishJob {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Job details
  platform Platform
  status   PublishStatus @default(PENDING)

  // Platform-specific metadata (overrides from Video)
  title       String?
  description String? @db.Text
  tags        String? // Comma-separated
  privacy     VideoPrivacy?

  // Scheduling
  scheduledFor DateTime? // If set, publish at this time
  startedAt    DateTime? // When job actually started
  completedAt  DateTime? // When job finished (success or fail)

  // Result
  platformVideoId  String? // Video ID on the platform (e.g., YouTube video ID)
  platformVideoUrl String? // Direct URL to video on platform
  errorMessage     String? @db.Text
  retryCount       Int     @default(0)

  // Relationships
  video   Video  @relation(fields: [videoId], references: [id], onDelete: Cascade)
  videoId String

  platformConnection   PlatformConnection @relation(fields: [platformConnectionId], references: [id], onDelete: Cascade)
  platformConnectionId String

  createdBy   User   @relation(fields: [createdById], references: [id], onDelete: Cascade)
  createdById String

  @@index([videoId])
  @@index([platformConnectionId])
  @@index([createdById])
  @@index([status])
  @@index([scheduledFor])
}

// ... existing Post, VerificationToken models ...

// Add relations to User model
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts           Account[]
  sessions           Session[]
  posts              Post[]

  // VideoBlade relations
  videos             Video[]
  platformConnections PlatformConnection[]
  publishJobs        PublishJob[]
}
```

**Key Design Decisions**:

- **CUID for IDs**: Better for distributed systems than auto-increment
- **Cascading Deletes**: When user/video deleted, related records auto-delete
- **Indexes**: For frequently queried fields (userId, status, createdAt)
- **Text Fields**: Description uses `@db.Text` for long content
- **Nullable Fields**: Optional metadata (tags, description, etc.)
- **JSON Metadata**: Flexible platform-specific data storage

### 2. Generate Migration

```bash
# Push schema changes to database
npm run db:push

# Or create a migration (for production)
npx prisma migrate dev --name add_videoblade_models
```

### 3. Regenerate Prisma Client

```bash
npm run db:generate
```

This updates the TypeScript types for the new models.

### 4. Verify Schema in Prisma Studio

```bash
npm run db:studio
```

You should see the new tables:

- Video
- PlatformConnection
- PublishJob

---

## Usage Examples

### Creating a Video Record

```typescript
// In tRPC procedure or server action
const video = await ctx.db.video.create({
  data: {
    s3Key: "videos/abc123.mp4",
    s3Bucket: "videoblade-dev-videos",
    fileName: "my-video.mp4",
    fileSize: BigInt(1024000), // 1 MB
    mimeType: "video/mp4",
    title: "My First Video",
    description: "This is a test video",
    privacy: "UNLISTED",
    createdById: ctx.session.user.id,
  },
});
```

### Creating a Platform Connection

```typescript
const connection = await ctx.db.platformConnection.create({
  data: {
    platform: "YOUTUBE",
    platformUserId: "UC_abc123",
    platformUsername: "MyYouTubeChannel",
    accessToken: "ya29.xxx",
    refreshToken: "1//xxx",
    tokenExpiry: new Date(Date.now() + 3600 * 1000), // 1 hour
    userId: ctx.session.user.id,
  },
});
```

### Creating a Publish Job

```typescript
const job = await ctx.db.publishJob.create({
  data: {
    platform: "YOUTUBE",
    status: "PENDING",
    title: video.title, // Can override
    description: video.description,
    privacy: "PUBLIC",
    videoId: video.id,
    platformConnectionId: connection.id,
    createdById: ctx.session.user.id,
  },
});
```

### Querying Videos with Publish Status

```typescript
const videos = await ctx.db.video.findMany({
  where: {
    createdById: ctx.session.user.id,
  },
  include: {
    publishJobs: {
      include: {
        platformConnection: true,
      },
    },
  },
  orderBy: {
    createdAt: "desc",
  },
});

// Each video will have publishJobs array with platform and status
```

---

## Data Validation

Add Zod schemas for input validation (use in tRPC procedures):

Create `src/lib/validators.ts`:

```typescript
import { z } from "zod";

export const createVideoSchema = z.object({
  s3Key: z.string().min(1),
  s3Bucket: z.string().min(1),
  fileName: z.string().min(1),
  fileSize: z.bigint().positive(),
  mimeType: z.string().regex(/^video\//),
  title: z.string().min(1).max(100),
  description: z.string().max(5000).optional(),
  tags: z.string().max(500).optional(),
  privacy: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]),
});

export const updateVideoMetadataSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(5000).optional(),
  tags: z.string().max(500).optional(),
  privacy: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]).optional(),
});

export const createPublishJobSchema = z.object({
  videoId: z.string().cuid(),
  platformConnectionId: z.string().cuid(),
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(5000).optional(),
  tags: z.string().max(500).optional(),
  privacy: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]).optional(),
  scheduledFor: z.date().optional(),
});
```

---

## Testing

### Test Video Creation

Create `scripts/test-db-schema.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Find a test user (or create one)
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error("No user found. Sign in to create a user first.");
    return;
  }

  console.log("Creating test video...");
  const video = await prisma.video.create({
    data: {
      s3Key: "test/video-123.mp4",
      s3Bucket: "videoblade-dev-videos",
      fileName: "test-video.mp4",
      fileSize: BigInt(1024000),
      mimeType: "video/mp4",
      title: "Test Video",
      description: "This is a test",
      privacy: "UNLISTED",
      createdById: user.id,
    },
  });
  console.log("✅ Video created:", video.id);

  console.log("\nCreating platform connection...");
  const connection = await prisma.platformConnection.create({
    data: {
      platform: "YOUTUBE",
      platformUserId: "test-user-id",
      platformUsername: "Test Channel",
      accessToken: "test-token",
      userId: user.id,
    },
  });
  console.log("✅ Platform connection created:", connection.id);

  console.log("\nCreating publish job...");
  const job = await prisma.publishJob.create({
    data: {
      platform: "YOUTUBE",
      status: "PENDING",
      videoId: video.id,
      platformConnectionId: connection.id,
      createdById: user.id,
    },
  });
  console.log("✅ Publish job created:", job.id);

  console.log("\nQuerying video with publish jobs...");
  const videoWithJobs = await prisma.video.findUnique({
    where: { id: video.id },
    include: {
      publishJobs: {
        include: {
          platformConnection: true,
        },
      },
    },
  });
  console.log("✅ Query successful");
  console.log("Video:", videoWithJobs?.title);
  console.log(
    "Publish jobs:",
    videoWithJobs?.publishJobs.map((j) => ({
      platform: j.platform,
      status: j.status,
    })),
  );

  // Cleanup
  console.log("\nCleaning up test data...");
  await prisma.publishJob.delete({ where: { id: job.id } });
  await prisma.platformConnection.delete({ where: { id: connection.id } });
  await prisma.video.delete({ where: { id: video.id } });
  console.log("✅ Cleanup complete");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run: `npx tsx scripts/test-db-schema.ts`

---

## Database Migrations

### Development

Use `db:push` for rapid iteration:

```bash
npm run db:push
```

This syncs schema without creating migration files.

### Production

Create proper migrations:

```bash
npx prisma migrate dev --name add_videoblade_models
```

This creates a migration file in `prisma/migrations/`.

**Commit migrations to Git** for production deployments.

---

## Common Issues

**BigInt Serialization Error**:

- JavaScript doesn't serialize BigInt by default
- Use `.toString()` when sending to client
- Or use regular `Int` if file sizes < 2GB

**@db.Text Not Recognized**:

- SQLite doesn't have separate Text type
- For Postgres, uncomment `@db.Text` annotations
- Keep them commented for SQLite development

**Unique Constraint Violations**:

- Ensure user doesn't connect same platform twice
- Use `@@unique([userId, platform])` constraint
- Handle errors gracefully in UI

---

## Checklist Summary

- [ ] Prisma schema updated with new models
- [ ] Enums defined (Platform, PublishStatus, VideoPrivacy)
- [ ] Relationships configured correctly
- [ ] Indexes added for performance
- [ ] Migration generated and applied
- [ ] Prisma client regenerated
- [ ] Validators created in `src/lib/validators.ts`
- [ ] Test script runs successfully
- [ ] Schema verified in Prisma Studio

**Estimated Completion**: ✅ 2-3 hours

---

## Next Step

Database foundation is ready! Now implement video upload:

👉 **[02-s3-upload.md](./02-s3-upload.md)** - Implement video upload to S3 with progress tracking
