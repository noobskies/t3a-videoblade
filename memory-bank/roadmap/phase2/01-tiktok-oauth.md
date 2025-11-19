# Phase 2: TikTok OAuth & API Setup

## Goal

Set up TikTok API credentials and create platform connection for TikTok publishing using Login Kit.

**Estimated Time**: 2-3 hours

---

## Prerequisites

- [x] Phase 1 complete - YouTube OAuth working
- [x] Platform router exists
- [ ] TikTok for Developers account

---

## TikTok API Overview

**Service**: TikTok Login Kit for Web & Content Posting API

**Documentation**: https://developers.tiktok.com/doc/login-kit-web/

**Key Endpoints**:

- **Authorize**: `https://www.tiktok.com/v2/auth/authorize/`
- **Token**: `https://open.tiktokapis.com/v2/oauth/token/`
- **User Info**: `https://open.tiktokapis.com/v2/user/info/`

**Scopes Required**:

- `user.info.basic` (Get display name, avatar)
- `video.upload` (Upload videos)
- `video.publish` (Publish videos - check if distinct from upload)

---

## Tasks

### 1. Get TikTok API Access

1. Go to [TikTok for Developers](https://developers.tiktok.com/)
2. Create an App (Type: Web)
3. Enable **Login Kit** and **Content Posting API** products
4. Configure Redirect URI: `http://localhost:3000/api/auth/callback/tiktok` (and production URL)
5. Get **Client Key** and **Client Secret**
6. Submit for review (if required for development access, otherwise use Sandbox)

### 2. Add TikTok to Database Enum

Update `prisma/schema.prisma`:

```prisma
enum Platform {
  YOUTUBE
  TIKTOK  // Add this
}
```

Run migration:

```bash
npm run db:push
```

### 3. Update Environment Variables

Add to `.env`:

```bash
TIKTOK_CLIENT_KEY="your-tiktok-client-key"
TIKTOK_CLIENT_SECRET="your-tiktok-client-secret"
```

Update `src/env.js`:

```typescript
server: {
  // ... existing
  TIKTOK_CLIENT_KEY: z.string().optional(),
  TIKTOK_CLIENT_SECRET: z.string().optional(),
},
runtimeEnv: {
  // ... existing
  TIKTOK_CLIENT_KEY: process.env.TIKTOK_CLIENT_KEY,
  TIKTOK_CLIENT_SECRET: process.env.TIKTOK_CLIENT_SECRET,
},
```

### 4. Configure Better Auth for TikTok

Update `src/server/auth.ts`:

```typescript
// Add TikTok provider
// Note: Better Auth may have a built-in TikTok provider, or use generic OAuth
// If generic:
{
  id: "tiktok",
  name: "TikTok",
  type: "oauth",
  clientId: env.TIKTOK_CLIENT_KEY,
  clientSecret: env.TIKTOK_CLIENT_SECRET,
  authorization: {
    url: "https://www.tiktok.com/v2/auth/authorize/",
    params: {
      scope: "user.info.basic,video.upload",
      response_type: "code",
    },
  },
  token: "https://open.tiktokapis.com/v2/oauth/token/",
  userinfo: "https://open.tiktokapis.com/v2/user/info/",
  // Map profile fields
}
```

**Verification**: Check if Better Auth has a dedicated TikTok provider. If so, use that. If not, configure custom OAuth.

### 5. Update Platforms UI

Update `src/app/platforms/page.tsx` to include TikTok card:

```typescript
// TikTok Card
<div className="max-w-2xl rounded-lg border border-gray-700 bg-gray-800 p-6">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      {/* Use a TikTok Icon */}
      <div>
        <h2 className="text-xl font-semibold">TikTok</h2>
        <p className="text-sm text-gray-400">
          Short-form video platform
        </p>
      </div>
    </div>
    {/* Connect/Disconnect buttons */}
  </div>
</div>
```

---

## Testing

1. **Get TikTok credentials**
2. **Connect TikTok** via platforms page
3. **Verify connection** stored in database (check `PlatformConnection` table)
4. **Verify tokens** (Access Token & Refresh Token should be saved)

---

## Checklist

- [ ] TikTok App created in Developer Portal
- [ ] TIKTOK enum added to schema
- [ ] Database migrated
- [ ] Environment variables configured
- [ ] Better Auth provider configured
- [ ] Platforms UI updated with TikTok
- [ ] Connection test successful

**Estimated Completion**: 2-3 hours

---

## Next Step

👉 **[02-tiktok-publisher.md](./02-tiktok-publisher.md)** - Implement TikTok video upload
