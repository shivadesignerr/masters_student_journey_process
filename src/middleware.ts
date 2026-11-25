import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("gvk_auth_session");

  let userRole: string | null = null;
  if (sessionCookie?.value) {
    try {
      const parsed = JSON.parse(sessionCookie.value);
      userRole = parsed.role;
    } catch {
      // Invalid session
    }
  }

  // 1. Root (/) ALWAYS redirects to /auth/login and clears any stale session so the login screen is displayed first
  if (pathname === "/") {
    const loginUrl = new URL("/auth/login", request.nextUrl);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("gvk_auth_session");
    response.cookies.set("gvk_auth_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
    return response;
  }

  // 2. Generic dashboard (/dashboard) redirects based on authenticated session, or to login
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    if (!userRole) {
      return NextResponse.redirect(new URL("/auth/login", request.nextUrl));
    }
    if (userRole === "student") {
      return NextResponse.redirect(new URL("/student/dashboard", request.nextUrl));
    }
    if (userRole === "counselor") {
      return NextResponse.redirect(new URL("/counselor/dashboard", request.nextUrl));
    }
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.nextUrl));
    }
    return NextResponse.redirect(new URL("/auth/login", request.nextUrl));
  }

  // 3. Guard Student Portal
  if (pathname === "/student" || pathname === "/student/") {
    if (!userRole) {
      const loginUrl = new URL("/auth/login", request.nextUrl);
      loginUrl.searchParams.set("role", "student");
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.redirect(new URL("/student/dashboard", request.nextUrl));
  }

  if (pathname.startsWith("/student/")) {
    if (!userRole) {
      const loginUrl = new URL("/auth/login", request.nextUrl);
      loginUrl.searchParams.set("role", "student");
      return NextResponse.redirect(loginUrl);
    }
    if (userRole !== "student") {
      if (userRole === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.nextUrl));
      }
      return NextResponse.redirect(new URL("/counselor/dashboard", request.nextUrl));
    }
  }

  // 4. Guard Counselor Portal
  if (pathname === "/counselor" || pathname === "/counselor/") {
    if (!userRole) {
      const loginUrl = new URL("/auth/login", request.nextUrl);
      loginUrl.searchParams.set("role", "counselor");
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.redirect(new URL("/counselor/dashboard", request.nextUrl));
  }

  if (pathname.startsWith("/counselor/")) {
    if (!userRole) {
      const loginUrl = new URL("/auth/login", request.nextUrl);
      loginUrl.searchParams.set("role", "counselor");
      return NextResponse.redirect(loginUrl);
    }
    if (userRole !== "counselor" && userRole !== "admin") {
      return NextResponse.redirect(new URL("/student/dashboard", request.nextUrl));
    }
  }

  // 5. Guard Admin Portal and legacy admin login endpoints
  if (pathname === "/masters_admin" || pathname === "/admin/login") {
    const loginUrl = new URL("/auth/login", request.nextUrl);
    loginUrl.searchParams.set("role", "admin");
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/admin" || pathname === "/admin/") {
    if (!userRole || userRole !== "admin") {
      const loginUrl = new URL("/auth/login", request.nextUrl);
      loginUrl.searchParams.set("role", "admin");
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.redirect(new URL("/admin/dashboard", request.nextUrl));
  }

  if (pathname.startsWith("/admin/")) {
    // Require admin role for all /admin routes
    if (!userRole || userRole !== "admin") {
      const loginUrl = new URL("/auth/login", request.nextUrl);
      loginUrl.searchParams.set("role", "admin");
      return NextResponse.redirect(loginUrl);
    }
  }

  // 6. Handle /auth/login navigation: Always display the login screen panel!
  // If an existing session cookie exists, clear it so the user starts with a clean, unauthenticated login screen.
  if (pathname === "/auth/login") {
    if (userRole) {
      const response = NextResponse.next();
      response.cookies.delete("gvk_auth_session");
      response.cookies.set("gvk_auth_session", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });
      return response;
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/dashboard/:path*",
    "/student",
    "/student/:path*",
    "/counselor",
    "/counselor/:path*",
    "/admin",
    "/admin/:path*",
    "/auth/login",
    "/masters_admin",
  ],
};
