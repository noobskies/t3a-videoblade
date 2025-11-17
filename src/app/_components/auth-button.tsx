"use client";

import { signIn, signOut, useSession } from "@/lib/auth-client";

export function AuthButton() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <button
        disabled
        className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
      >
        Loading...
      </button>
    );
  }

  if (session) {
    return (
      <button
        onClick={() => signOut()}
        className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
      >
        Sign out
      </button>
    );
  }

  return (
    <button
      onClick={() =>
        signIn.social({
          provider: "google",
          callbackURL: "/",
        })
      }
      className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
    >
      Sign in with Google
    </button>
  );
}
