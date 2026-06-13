import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value || null;
  const role = req.cookies.get("role")?.value?.toLowerCase() || null;

  const { pathname } = req.nextUrl;

  // PUBLIC ROUTES
  const isLoginPage = pathname === "/login";
  const isPublic = pathname.startsWith("/public") || isLoginPage;

  if (isPublic) return NextResponse.next();

  // ----------------------------------
  // RBAC ROUTE DEFINITIONS
  // ----------------------------------
  const accessMap: Record<string, string[]> = {
    "/admin": ["admin"],
    "/manager": ["admin", "manager"],
    "/frontdesk": ["admin", "manager", "frontmanager", "frontdesk"],
    "/staff": ["admin", "manager", "frontmanager", "staff"],
  };

  // Determine which protected area the user is trying to access
  const matchedRoute = Object.keys(accessMap).find((prefix) =>
    pathname.startsWith(prefix)
  );

  // If route requires protection
  if (matchedRoute) {
    // Not logged in → redirect to login
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Check allowed roles
    const allowedRoles = accessMap[matchedRoute];

    if (!allowedRoles.includes(role as string)) {
      return NextResponse.redirect(new URL("/403", req.url));
    }
  }

  // Already logged in → Prevent access to login page
  if (token && isLoginPage) {
    if (role === "frontmanager" || role === "frontdesk") {
      return NextResponse.redirect(new URL("/frontdesk/dashboard", req.url));
    }

    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/manager/:path*",
    "/frontdesk/:path*",
    "/staff/:path*",
    "/login",
  ],
};
