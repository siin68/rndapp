import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { locales } from "./i18n/request";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and auth routes
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    pathname.includes(".") ||
    pathname.includes("/login")
  ) {
    return intlMiddleware(request);
  }

  // Get the auth token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Check if user is authenticated
  if (!token) {
    // If accessing protected routes without auth, redirect to login
    if (pathname.includes("/dashboard") || pathname.includes("/onboarding")) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    return intlMiddleware(request);
  }

  // User is authenticated
  // Let components handle onboarding checks instead of middleware
  // This prevents redirect loops and ensures fresh data from API calls

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
