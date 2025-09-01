import { NextResponse } from "next/server";

export function middleware(req) {
  const path = req.nextUrl.pathname;

  // Only true public routes (no auth required)
  const isPublicPath = ["/login", "/register", "/verifyemail"].includes(path);

  const token = req.cookies.get("token")?.value || "";

  // If logged in and trying to access public routes → redirect to /home
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  // If not logged in and trying to access protected routes → redirect to /login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Default → continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/home",
    "/verifyemail",
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/playlists/:path*",
    "/analytics/:path*",
    "/history",
    "/liked",
  ],
};
