# Phase 1: Platform Management UI

## Goal

Build UI for users to connect and manage their YouTube account connection.

**Estimated Time**: 2-3 hours

---

## Prerequisites

- [x] 04-youtube-oauth.md - Platform router created
- [x] Better Auth OAuth working

---

## What We're Building

A simple page showing:

- Connected platforms (YouTube)
- Connection status
- Button to connect YouTube
- Button to disconnect

---

## Tasks

### Create Platforms Page

Create `src/app/platforms/page.tsx`:

```typescript
"use client";

import { api } from "@/trpc/react";
import { Youtube, Check, X } from "lucide-react";

export default function PlatformsPage() {
  const { data: connections, isLoading, refetch } = api.platform.list.useQuery();
  const connectYouTube = api.platform.connectYouTube.useMutation();
  const disconnect = api.platform.disconnect.useMutation();

  const youtubeConnection = connections?.find((c) => c.platform === "YOUTUBE");

  const handleConnectYouTube = async () => {
    try {
      await connectYouTube.mutateAsync();
      await refetch();
      alert("YouTube connected successfully!");
    } catch (error: any) {
      alert(error.message || "Failed to connect YouTube");
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm("Disconnect YouTube? You won't be able to publish until you reconnect.")) return;

    try {
      await disconnect.mutateAsync({ id });
      await refetch();
    } catch (error) {
      alert("Failed to disconnect");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-4xl font-bold">Platform Connections</h1>

        {/* YouTube Card */}
        <div className="max-w-2xl rounded-lg border border-gray-700 bg-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Youtube className="h-10 w-10 text-red-500" />
              <div>
                <h2 className="text-xl font-semibold">YouTube</h2>
                <p className="text-sm text-gray-400">
                  Upload and publish videos to your channel
                </p>
              </div>
            </div>

            {youtubeConnection ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-green-400">
                  <Check className="h-5 w-5" />
                  <span className="text-sm">Connected</span>
                </div>
                <button
                  onClick={() => handleDisconnect(youtubeConnection.id)}
                  disabled={disconnect.isPending}
                  className="rounded bg-red-900/50 px-4 py-2 text-sm hover:bg-red-900 disabled:opacity-50"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectYouTube}
                disabled={connectYouTube.isPending}
                className="rounded bg-blue-600 px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
              >
                {connectYouTube.isPending ? "Connecting..." : "Connect"}
              </button>
            )}
          </div>

          {youtubeConnection && (
            <div className="mt-4 border-t border-gray-700 pt-4 text-sm text-gray-400">
              <p>Channel: {youtubeConnection.platformUsername}</p>
              <p>
                Connected: {new Date(youtubeConnection.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 max-w-2xl rounded-lg border border-blue-900/50 bg-blue-900/20 p-4 text-sm">
          <p className="text-blue-200">
            <strong>Note:</strong> You must sign in with Google to connect YouTube. Make sure
            you've granted YouTube permissions during sign-in.
          </p>
        </div>
      </div>
    </main>
  );
}
```

### Add to Navigation

Update navigation links to include Platforms page.

---

## Testing

1. **Navigate to** `/platforms`
2. **If not connected**: Click "Connect" button
3. **Verify**: Should see "Connected" status
4. **Check database**: PlatformConnection record created
5. **Click Disconnect**: Should remove connection
6. **Reconnect**: Should work again

---

## Checklist

- [ ] Platforms page created
- [ ] Connect YouTube button works
- [ ] Disconnect button works
- [ ] Connection status displays correctly
- [ ] Added to navigation

**Estimated Completion**: ✅ 2-3 hours

---

## Next Step

👉 **[06-metadata-editing.md](./06-metadata-editing.md)** - Edit video metadata before publishing
