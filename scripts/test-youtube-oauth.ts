/* eslint-disable */
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function testYouTubeOAuth() {
  console.log("🔍 Testing YouTube OAuth Configuration...\n");

  // Get a user's Google account
  const account = await prisma.account.findFirst({
    where: { providerId: "google" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!account) {
    console.log("❌ No Google account found. Sign in first.");
    console.log("   Go to http://localhost:3000 and sign in with Google.\n");
    return;
  }

  console.log("✅ Google account found");
  console.log(`   User: ${account.user?.name} (${account.user?.email})`);
  console.log(
    `   Access token: ${account.accessToken ? "✅ Present" : "❌ Missing"}`,
  );
  console.log(
    `   Refresh token: ${account.refreshToken ? "✅ Present" : "❌ Missing"}`,
  );
  console.log(
    `   Expires at: ${account.accessTokenExpiresAt?.toISOString() ?? "Unknown"}`,
  );

  if (!account.refreshToken) {
    console.log(
      "\n⚠️  Warning: No refresh token. Token may expire after 1 hour.",
    );
    console.log(
      "   Make sure Better Auth is configured with accessType: 'offline'",
    );
  }

  // Test YouTube API call
  if (account.accessToken) {
    console.log("\n📡 Testing YouTube API access...");

    try {
      const response = await fetch(
        "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
        {
          headers: {
            Authorization: `Bearer ${account.accessToken}`,
          },
        },
      );

      if (response.ok) {
        const data = (await response.json()) as {
          items?: Array<{
            id: string;
            snippet: { title: string; description: string };
          }>;
        };

        if (data.items && data.items.length > 0) {
          console.log("✅ YouTube API access working!");
          console.log(`   Channel: ${data.items[0].snippet.title}`);
          console.log(`   Channel ID: ${data.items[0].id}`);
        } else {
          console.log("⚠️  No YouTube channel found for this account");
          console.log("   User must have a YouTube channel to publish videos");
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ YouTube API call failed: ${response.status}`);
        console.log(`   Error: ${errorText}`);

        if (response.status === 403) {
          console.log(
            "\n💡 Possible causes:\n   - YouTube Data API v3 not enabled in Google Cloud Console\n   - User did not grant YouTube permissions during OAuth\n   - API quota exceeded",
          );
        } else if (response.status === 401) {
          console.log(
            "\n💡 Token expired or invalid. User may need to reconnect.",
          );
        }
      }
    } catch (error) {
      console.error("❌ Error calling YouTube API:", error);
    }
  }

  console.log("\n✅ Test complete!");
}

testYouTubeOAuth()
  .catch((error) => {
    console.error("Test failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
