/* eslint-disable */
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🧪 Testing VideoBlade Database Schema...\n");

  // Find a test user (or create one)
  let user = await prisma.user.findFirst();
  if (!user) {
    console.error("❌ No user found. Sign in to create a user first.");
    console.log("   Run: npm run dev");
    console.log("   Then sign in with Google OAuth");
    return;
  }

  console.log(`✅ Found test user: ${user.email}\n`);

  // Test 1: Create Video
  console.log("📹 Test 1: Creating video...");
  const video = await prisma.video.create({
    data: {
      s3Key: "test/video-123.mp4",
      s3Bucket: "videoblade-dev-videos",
      fileName: "test-video.mp4",
      fileSize: BigInt(1024000), // 1 MB
      mimeType: "video/mp4",
      title: "Test Video",
      description: "This is a test video for schema validation",
      privacy: "UNLISTED",
      duration: 120, // 2 minutes
      createdById: user.id,
    },
  });
  console.log(`✅ Video created: ${video.id}`);
  console.log(`   Title: ${video.title}`);
  console.log(`   File: ${video.fileName}`);
  console.log(`   Size: ${video.fileSize.toString()} bytes\n`);

  // Test 2: Create Platform Connection
  console.log("🔗 Test 2: Creating platform connection...");
  const connection = await prisma.platformConnection.create({
    data: {
      platform: "YOUTUBE",
      platformUserId: "test-user-id-123",
      platformUsername: "Test Channel",
      accessToken: "test-access-token",
      refreshToken: "test-refresh-token",
      tokenExpiry: new Date(Date.now() + 3600 * 1000), // 1 hour from now
      userId: user.id,
    },
  });
  console.log(`✅ Platform connection created: ${connection.id}`);
  console.log(`   Platform: ${connection.platform}`);
  console.log(`   Username: ${connection.platformUsername}`);
  console.log(`   Active: ${connection.isActive}\n`);

  // Test 3: Create Publish Job
  console.log("📤 Test 3: Creating publish job...");
  const job = await prisma.publishJob.create({
    data: {
      platform: "YOUTUBE",
      status: "PENDING",
      title: video.title,
      description: video.description,
      privacy: "PUBLIC",
      videoId: video.id,
      platformConnectionId: connection.id,
      createdById: user.id,
    },
  });
  console.log(`✅ Publish job created: ${job.id}`);
  console.log(`   Platform: ${job.platform}`);
  console.log(`   Status: ${job.status}`);
  console.log(`   Video: ${video.title}\n`);

  // Test 4: Query with Relations
  console.log("🔍 Test 4: Querying video with publish jobs...");
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
  console.log(`✅ Query successful`);
  console.log(`   Video: ${videoWithJobs?.title}`);
  console.log(`   Publish jobs: ${videoWithJobs?.publishJobs.length}`);
  if (videoWithJobs?.publishJobs[0]) {
    console.log(
      `   - Platform: ${videoWithJobs.publishJobs[0].platform} (${videoWithJobs.publishJobs[0].status})`,
    );
  }
  console.log();

  // Test 5: Update Job Status
  console.log("✏️  Test 5: Updating job status...");
  const updatedJob = await prisma.publishJob.update({
    where: { id: job.id },
    data: {
      status: "COMPLETED",
      platformVideoId: "youtube-video-id-456",
      platformVideoUrl: "https://youtube.com/watch?v=test123",
      completedAt: new Date(),
    },
  });
  console.log(`✅ Job updated: ${updatedJob.id}`);
  console.log(`   Status: ${updatedJob.status}`);
  console.log(`   Platform Video ID: ${updatedJob.platformVideoId}\n`);

  // Test 6: Query User with All Relations
  console.log("👤 Test 6: Querying user with all VideoBlade relations...");
  const userWithRelations = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      videos: true,
      platformConnections: true,
      publishJobs: true,
    },
  });
  console.log(`✅ User query successful`);
  console.log(`   Email: ${userWithRelations?.email}`);
  console.log(`   Videos: ${userWithRelations?.videos.length}`);
  console.log(
    `   Platform Connections: ${userWithRelations?.platformConnections.length}`,
  );
  console.log(`   Publish Jobs: ${userWithRelations?.publishJobs.length}\n`);

  // Cleanup
  console.log("🧹 Cleaning up test data...");
  await prisma.publishJob.delete({ where: { id: job.id } });
  await prisma.platformConnection.delete({ where: { id: connection.id } });
  await prisma.video.delete({ where: { id: video.id } });
  console.log("✅ Cleanup complete\n");

  console.log("🎉 All tests passed! Database schema is working correctly.");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
