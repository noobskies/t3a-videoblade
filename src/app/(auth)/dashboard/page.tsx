import { redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "@/server/auth";

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                🎬 VideoBlade
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt="Profile"
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {session.user.name}
                </span>
              </div>
              <Link
                href="/api/auth/signout"
                className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Sign out
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="mt-2 text-gray-600">
            Welcome to your content creator dashboard
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-white">
                  📹
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Videos</p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500 text-white">
                  📅
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Scheduled Posts</p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-500 text-white">
                  🔗
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Connected Channels</p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-yellow-500 text-white">
                  📊
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Views</p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            🚀 Getting Started
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900">Connect Your YouTube Channel</p>
                <p className="text-sm text-gray-600">
                  Link your YouTube account to start uploading and scheduling videos
                </p>
                <button className="mt-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                  Connect YouTube
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-400 text-sm font-medium">
                2
              </div>
              <div>
                <p className="font-medium text-gray-500">Upload Your First Video</p>
                <p className="text-sm text-gray-400">
                  Upload a video file and add metadata
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-400 text-sm font-medium">
                3
              </div>
              <div>
                <p className="font-medium text-gray-500">Schedule Your Content</p>
                <p className="text-sm text-gray-400">
                  Set up your publishing schedule across platforms
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/videos"
            className="rounded-lg bg-white p-6 shadow transition hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">📹</div>
              <div>
                <h4 className="font-medium text-gray-900">Video Library</h4>
                <p className="text-sm text-gray-600">Manage your video content</p>
              </div>
            </div>
          </Link>

          <Link
            href="/calendar"
            className="rounded-lg bg-white p-6 shadow transition hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">📅</div>
              <div>
                <h4 className="font-medium text-gray-900">Schedule Calendar</h4>
                <p className="text-sm text-gray-600">Plan your content schedule</p>
              </div>
            </div>
          </Link>

          <Link
            href="/analytics"
            className="rounded-lg bg-white p-6 shadow transition hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">📊</div>
              <div>
                <h4 className="font-medium text-gray-900">Analytics</h4>
                <p className="text-sm text-gray-600">Track your performance</p>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
