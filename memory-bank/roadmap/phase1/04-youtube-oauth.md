# Phase 1: YouTube OAuth Integration

## Goal

Verify YouTube OAuth is working with Better Auth and can access YouTube API with proper scopes.

**Estimated Time**: 2 hours

---

## Prerequisites

- [x] 00-prerequisites.md - YouTube API credentials configured
- [x] Better Auth with Google OAuth working
- [x] 01-database-schema.md - PlatformConnection model exists

---

## What's Already Done

✅ Better Auth is configured with YouTube scopes:

- `https://www.googleapis.com/auth/youtube.upload`
- `https://www.googleapis.com/auth/youtube.readonly`

✅ Google OAuth button exists in auth-button.tsx

---

## Tasks

### 1. Verify YouTube Scopes

Check `src/server/auth.ts` has correct configuration:

```typescript
google: googleAuth({
  clientId: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
  redirectURI: `${env.BETTER_AUTH_URL}/api/auth/callback/google`,
  accessType: "offline", // ✅ Required for refresh token
  scope: [
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly",
  ],
}),
```

**Key settings**:

- `accessType: "offline"` - Gets refresh token
- YouTube scopes included

### 2. Test OAuth Flow

1. **Sign in** with Google
2. **Check consent screen** - should request YouTube permissions
3. **Verify token** in Account table

Query database to see stored tokens:

```sql
SELECT * FROM Account WHERE provider = 'google';
```

Should see:

- `accessToken` (long string)
- `refreshToken` (if offline access granted)
- `expiresAt` (timestamp)

### 3. Create Platform Router

Create `src/server/api/routers/platform.ts`:

```typescript
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const platformRouter = createTRPCRouter({
  /**
   * Get user's connected platforms
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const connections = await ctx.db.platformConnection.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Don't expose full tokens to client
    return connections.map((conn) => ({
      id: conn.id,
      platform: conn.platform,
      platformUsername: conn.platformUsername,
      isActive: conn.isActive,
      createdAt: conn.createdAt,
    }));
  }),

  /**
   * Create platform connection from OAuth account
   */
  connectYouTube: protectedProcedure.mutation(async ({ ctx }) => {
    // Get user's Google account from Better Auth
    const googleAccount = await ctx.db.account.findFirst({
      where: {
        userId: ctx.session.user.id,
        provider: "google",
      },
    });

    if (!googleAccount) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Google account not connected. Please sign in with Google.",
      });
    }

    if (!googleAccount.accessToken) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No access token found. Please reconnect your Google account.",
      });
    }

    // Check if already connected
    const existing = await ctx.db.platformConnection.findUnique({
      where: {
        userId_platform: {
          userId: ctx.session.user.id,
          platform: "YOUTUBE",
        },
      },
    });

    if (existing) {
      // Update existing connection
      const updated = await ctx.db.platformConnection.update({
        where: { id: existing.id },
        data: {
          accessToken: googleAccount.accessToken,
          refreshToken: googleAccount.refreshToken || null,
          tokenExpiry: googleAccount.expiresAt
            ? new Date(googleAccount.expiresAt * 1000)
            : null,
          isActive: true,
        },
      });

      return { id: updated.id, platform: "YOUTUBE", new: false };
    }

    // Create new connection
    const connection = await ctx.db.platformConnection.create({
      data: {
        platform: "YOUTUBE",
        platformUserId: googleAccount.accountId, // Google user ID
        platformUsername: ctx.session.user.name || "Unknown",
        accessToken: googleAccount.accessToken,
        refreshToken: googleAccount.refreshToken || null,
        tokenExpiry: googleAccount.expiresAt
          ? new Date(googleAccount.expiresAt * 1000)
          : null,
        userId: ctx.session.user.id,
      },
    });

    return { id: connection.id, platform: "YOUTUBE", new: true };
  }),

  /**
   * Disconnect platform
   */
  disconnect: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const connection = await ctx.db.platformConnection.findUnique({
        where: { id: input.id },
      });

      if (!connection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Connection not found",
        });
      }

      if (connection.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not your connection",
        });
      }

      await ctx.db.platformConnection.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
```

### 4. Add Platform Router to Root

Update `src/server/api/root.ts`:

```typescript
import { platformRouter } from "@/server/api/routers/platform";

export const appRouter = createTRPCRouter({
  post: postRouter,
  video: videoRouter,
  platform: platformRouter, // Add this
});
```

---

## Testing

### Test OAuth Scopes

Create `scripts/test-youtube-oauth.ts`:

```typescript
import { auth } from "@/server/auth";
import { db } from "@/server/db";

async function testYouTubeOAuth() {
  // Get a user's account
  const account = await db.account.findFirst({
    where: { provider: "google" },
  });

  if (!account) {
    console.log("❌ No Google account found. Sign in first.");
    return;
  }

  console.log("✅ Google account found");
  console.log(
    "Access token:",
    account.accessToken ? "✅ Present" : "❌ Missing",
  );
  console.log(
    "Refresh token:",
    account.refreshToken ? "✅ Present" : "❌ Missing",
  );
  console.log(
    "Expires at:",
    account.expiresAt ? new Date(account.expiresAt * 1000) : "Unknown",
  );

  // Test YouTube API call
  if (account.accessToken) {
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
        const data = await response.json();
        console.log("✅ YouTube API access working!");
        console.log("Channel:", data.items?.[0]?.snippet?.title || "Unknown");
      } else {
        console.log("❌ YouTube API call failed:", response.status);
        const error = await response.text();
        console.log("Error:", error);
      }
    } catch (error) {
      console.error("❌ Error calling YouTube API:", error);
    }
  }
}

testYouTubeOAuth();
```

Run: `npx tsx scripts/test-youtube-oauth.ts`

### Expected Output

```
✅ Google account found
Access token: ✅ Present
Refresh token: ✅ Present
Expires at: 2025-11-17T15:30:00.000Z
✅ YouTube API access working!
Channel: My YouTube Channel
```

---

## Common Issues

**No Refresh Token**:

- Ensure `accessType: "offline"` is set
- User may need to revoke access and reconnect
- First-time consent gives refresh token

**YouTube API 403 Error**:

- Check scopes in Google Cloud Console
- Verify user granted YouTube permissions
- Ensure YouTube Data API v3 is enabled

**Token Expired**:

- Implement token refresh logic (next steps)
- Better Auth should handle this automatically
- Check `expiresAt` timestamp

**No YouTube Channel**:

- User must have a YouTube channel
- Create one at youtube.com if needed

---

## Security Notes

⚠️ **Never expose access tokens to client**

- Keep in database only
- Use server-side procedures
- Don't include in API responses

⚠️ **Token Refresh**

- Tokens expire after 1 hour
- Better Auth handles refresh automatically
- Ensure refresh token is stored

---

## Checklist Summary

- [ ] Better Auth YouTube scopes verified
- [ ] OAuth flow tested manually
- [ ] Platform router created
- [ ] Platform router added to app router
- [ ] Test script runs successfully
- [ ] YouTube API call works
- [ ] Refresh token present

**Estimated Completion**: ✅ 2 hours

---

## Next Step

OAuth is working! Now build platform management UI:

👉 **[05-platform-management.md](./05-platform-management.md)** - UI for connecting/disconnecting YouTube
