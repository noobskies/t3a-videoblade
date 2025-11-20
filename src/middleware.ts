import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define protected routes
  const isProtectedRoute =
    path.startsWith("/library") ||
    path.startsWith("/upload") ||
    path.startsWith("/platforms") ||
    path.startsWith("/publish") ||
    path.startsWith("/video");

  // Check for session token in cookies
  // Better Auth uses "better-auth.session_token" by default
  const sessionToken = request.cookies.get("better-auth.session_token");

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !sessionToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
