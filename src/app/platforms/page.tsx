"use client";

import { api } from "@/trpc/react";
import type { PlatformConnectionList } from "@/lib/types";
import { Youtube, Check } from "lucide-react";

/**
 * Type guard to ensure we have valid platform connection data
 * This satisfies both TypeScript and ESLint's strict type checking
 */
function isValidPlatformList(data: unknown): data is PlatformConnectionList {
  return Array.isArray(data);
}

export default function PlatformsPage() {
  const query = api.platform.list.useQuery();
  const connectYouTube = api.platform.connectYouTube.useMutation();
  const disconnect = api.platform.disconnect.useMutation();

  const handleConnectYouTube = async () => {
    try {
      await connectYouTube.mutateAsync();
      await query.refetch();
      alert("YouTube connected successfully!");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to connect YouTube";
      alert(errorMessage);
    }
  };

  const handleDisconnect = async (id: string) => {
    if (
      !confirm(
        "Disconnect YouTube? You won't be able to publish until you reconnect.",
      )
    )
      return;

    try {
      await disconnect.mutateAsync({ id });
      await query.refetch();
    } catch (error) {
      alert("Failed to disconnect");
    }
  };

  // Handle loading state
  if (query.isLoading || !query.data) {
    return null;
  }

  // Handle error state - Next.js error.tsx will catch this
  if (query.error) {
    throw new Error(query.error.message);
  }

  // Validate data shape - this is an actual error if it fails
  if (!isValidPlatformList(query.data)) {
    throw new Error(
      "Invalid platform connection data format received from API",
    );
  }

  const connections: PlatformConnectionList = query.data;
  const youtubeConnection = connections.find((c) => c.platform === "YOUTUBE");

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
                  {disconnect.isPending ? "Disconnecting..." : "Disconnect"}
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
                Connected:{" "}
                {new Date(youtubeConnection.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 max-w-2xl rounded-lg border border-blue-900/50 bg-blue-900/20 p-4 text-sm">
          <p className="text-blue-200">
            <strong>Note:</strong> You must sign in with Google to connect
            YouTube. Make sure you&apos;ve granted YouTube permissions during
            sign-in.
          </p>
        </div>
      </div>
    </main>
  );
}
