import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { LandingPage } from "@/app/_components/landing/landing-page";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Unauthenticated: Show Landing Page
  if (!session?.user) {
    return <LandingPage />;
  }

  // Authenticated: Redirect to Dashboard
  redirect("/dashboard");
}
