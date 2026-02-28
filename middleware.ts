import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware: protect app routes behind LTI session.
 *
 * When DATABASE_URL is set, routes under /dashboard, /reader, and /interactive
 * require the ilit_session cookie. Without it, redirect to landing page.
 *
 * When DATABASE_URL is NOT set (local dev without LMS), all routes pass through.
 */
export function middleware(request: NextRequest) {
  // Skip LTI auth enforcement when no database is configured (local dev)
  if (!process.env.DATABASE_URL) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Public routes -- no session required
  if (
    pathname === "/" ||
    pathname.startsWith("/api/lti") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionToken = request.cookies.get("ilit_session")?.value;
  if (!sessionToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("error", "no_session");
    return NextResponse.redirect(url);
  }

  // Cookie exists -- allow through (full validation happens in API/pages)
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/reader/:path*", "/interactive/:path*"],
};
