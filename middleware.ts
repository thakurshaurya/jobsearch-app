import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // NextAuth / Auth.js session token cookie names:
  // In development: "authjs.session-token" or legacy "next-auth.session-token"
  // In production (HTTPS): "__Secure-authjs.session-token" or "__Secure-next-auth.session-token"
  const authJsToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  // Custom credentials token
  const customToken = request.cookies.get("token")?.value;

  let isAuthenticated = Boolean(authJsToken);

  if (!isAuthenticated && customToken) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      await jwtVerify(customToken, secret);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  const protectedRoutes = ["/dashboard", "/jobs", "/applications", "/upload", "/profile"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );

  const publicAuthRoutes = ["/signup", "/login", "/forgot-password", "/reset-password"];
  const isPublicAuthRoute = publicAuthRoutes.some((route) =>
    path === route || path.startsWith(`${route}/`)
  );

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (Auth.js API routes)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth|public).*)",
  ],
};
