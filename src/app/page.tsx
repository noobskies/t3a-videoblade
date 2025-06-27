import Link from "next/link";

import { auth } from "@/server/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#1e1b4b] to-[#0f0f23] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-extrabold tracking-tight sm:text-[6rem]">
            🎬 <span className="text-[hsl(280,100%,70%)]">VideoBlade</span>
          </h1>
          <p className="mt-4 text-xl text-gray-300">
            The Ultimate Content Creator Platform
          </p>
          <p className="mt-2 text-lg text-gray-400">
            Upload once, schedule everywhere, and manage your content across multiple platforms
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 md:gap-8">
          <div className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-6 text-center">
            <div className="text-4xl">📺</div>
            <h3 className="text-xl font-bold">Multi-Platform Publishing</h3>
            <div className="text-sm text-gray-300">
              Schedule videos to YouTube, TikTok, Instagram, and more
            </div>
          </div>
          <div className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-6 text-center">
            <div className="text-4xl">📅</div>
            <h3 className="text-xl font-bold">Smart Scheduling</h3>
            <div className="text-sm text-gray-300">
              Calendar and list views with drag-and-drop capabilities
            </div>
          </div>
          <div className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-6 text-center">
            <div className="text-4xl">📊</div>
            <h3 className="text-xl font-bold">Analytics Dashboard</h3>
            <div className="text-sm text-gray-300">
              Track performance across all your platforms
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          {session?.user ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt="Profile"
                    className="h-12 w-12 rounded-full"
                  />
                )}
                <div>
                  <p className="text-xl font-semibold">Welcome back, {session.user.name}!</p>
                  <p className="text-sm text-gray-400">{session.user.email}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-purple-600 px-8 py-3 font-semibold text-white transition hover:bg-purple-700"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/api/auth/signout"
                  className="rounded-lg bg-white/10 px-8 py-3 font-semibold transition hover:bg-white/20"
                >
                  Sign out
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <p className="text-lg text-gray-300">
                Get started by connecting your YouTube channel
              </p>
              <Link
                href="/api/auth/signin"
                className="flex items-center gap-3 rounded-lg bg-red-600 px-8 py-4 font-semibold text-white transition hover:bg-red-700"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                Sign in with Google
              </Link>
              <p className="text-sm text-gray-500">
                Connect your YouTube channel to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
