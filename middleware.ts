import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware: protect app routes behind LTI session.
 *
 * Only enforces auth when LTI_AUTH_REQUIRED=true is explicitly set.
 * This allows the app to work standalone (demo/dev) while still supporting
 * LTI launches when integrated with an LMS.
 */
export function middleware(request: NextRequest) {
  // Only enforce LTI session auth when explicitly enabled
  if (process.env.LTI_AUTH_REQUIRED !== "true") {
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
