# Phase 2: Rumble OAuth & API Setup

## Goal

Set up Rumble API credentials and create platform connection for Rumble publishing.

**Estimated Time**: 2-3 hours

---

## Prerequisites

- [x] Phase 1 complete - YouTube OAuth working
- [x] Platform router exists
- [ ] Rumble account created

---

## Rumble API Overview

**Important**: As of 2025, Rumble's API availability varies:

- Check https://rumble.com/developer/ for latest API documentation
- May require API key or OAuth flow
- Some operations may need manual approval

---

## Tasks

### 1. Get Rumble API Access

**Option A: If Rumble has OAuth**:

1. Go to Rumble Developer Portal
2. Create application
3. Get Client ID and Client Secret
4. Configure redirect URL: `http://localhost:3000/api/auth/callback/rumble`

**Option B: If Rumble uses API Keys**:

1. Go to Rumble account settings
2. Generate API key
3. Store securely

### 2. Add Rumble to Database Enum

Update `prisma/schema.prisma`:

```prisma
enum Platform {
  YOUTUBE
  RUMBLE  // Add this
}
```

Run migration:

```bash
npm run db:push
```

### 3. Update Environment Variables

Add to `.env`:

```bash
# Rumble (if OAuth)
RUMBLE_CLIENT_ID="your-rumble-client-id"
RUMBLE_CLIENT_SECRET="your-rumble-client-secret"

# Rumble (if API Key)
RUMBLE_API_KEY="your-rumble-api-key"
```

Update `src/env.js`:

```typescript
server: {
  // ... existing
  RUMBLE_CLIENT_ID: z.string().optional(),
  RUMBLE_CLIENT_SECRET: z.string().optional(),
  RUMBLE_API_KEY: z.string().optional(),
},
runtimeEnv: {
  // ... existing
  RUMBLE_CLIENT_ID: process.env.RUMBLE_CLIENT_ID,
  RUMBLE_CLIENT_SECRET: process.env.RUMBLE_CLIENT_SECRET,
  RUMBLE_API_KEY: process.env.RUMBLE_API_KEY,
},
```

### 4. Add Rumble Connection Procedure

Update `src/server/api/routers/platform.ts`:

```typescript
/**
 * Connect Rumble (API Key method)
 */
connectRumble: protectedProcedure
  .input(z.object({
    apiKey: z.string(),
    username: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    // Verify API key works by making test request
    const testResponse = await fetch("https://rumble.com/api/v1/verify", {
      headers: {
        "Authorization": `Bearer ${input.apiKey}`,
      },
    });

    if (!testResponse.ok) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid Rumble API key",
      });
    }

    const rumbleUser = await testResponse.json();

    // Check if already connected
    const existing = await ctx.db.platformConnection.findUnique({
      where: {
        userId_platform: {
          userId: ctx.session.user.id,
          platform: "RUMBLE",
        },
      },
    });

    if (existing) {
      // Update existing
      await ctx.db.platformConnection.update({
        where: { id: existing.id },
        data: {
          accessToken: input.apiKey,
          platformUsername: input.username || rumbleUser.username,
          isActive: true,
        },
      });
      return { id: existing.id, platform: "RUMBLE", new: false };
    }

    // Create new connection
    const connection = await ctx.db.platformConnection.create({
      data: {
        platform: "RUMBLE",
        platformUserId: rumbleUser.id || "unknown",
        platformUsername: input.username || rumbleUser.username,
        accessToken: input.apiKey,
        userId: ctx.session.user.id,
      },
    });

    return { id: connection.id, platform: "RUMBLE", new: true };
  }),
```

### 5. Update Platforms UI

Update `src/app/platforms/page.tsx` to include Rumble card:

```typescript
// Add Rumble connection UI similar to YouTube
const rumbleConnection = connections?.find((c) => c.platform === "RUMBLE");

// Rumble Card
<div className="max-w-2xl rounded-lg border border-gray-700 bg-gray-800 p-6">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      <Video className="h-10 w-10 text-green-500" />
      <div>
        <h2 className="text-xl font-semibold">Rumble</h2>
        <p className="text-sm text-gray-400">
          Alternative video platform with growing audience
        </p>
      </div>
    </div>
    {/* Connect/Disconnect buttons */}
  </div>
</div>
```

---

## Rumble API Resources

**Official Documentation**:

- https://rumble.com/developer/
- https://help.rumble.com/

**Note**: Rumble's API may be in beta or require approval. Be prepared to adapt based on actual API availability.

---

## Testing

1. **Get Rumble credentials**
2. **Connect Rumble** via platforms page
3. **Verify connection** stored in database
4. **Test API call** to Rumble (simple endpoint)

---

## Common Issues

**No API Access**:

- Rumble may not have public API yet
- May need to request beta access
- Alternative: Manual upload workflow

**API Key Invalid**:

- Check Rumble account settings
- Verify key copied correctly
- Keys may expire

---

## Checklist

- [ ] Rumble API credentials obtained
- [ ] RUMBLE enum added to schema
- [ ] Database migrated
- [ ] Environment variables configured
- [ ] Connect Rumble procedure added
- [ ] Platforms UI updated with Rumble
- [ ] Connection test successful

**Estimated Completion**: ✅ 2-3 hours

---

## Next Step

👉 **[02-rumble-publisher.md](./02-rumble-publisher.md)** - Implement Rumble video upload
