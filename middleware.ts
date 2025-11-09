import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const pathname = req.nextUrl.pathname

  // Allow public pages
  if (
    pathname === "/" ||
    pathname === "/teacher/login" ||
    pathname === "/student/auth" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/auth/register")
  ) {
    return NextResponse.next()
  }

  // Protect teacher routes
  if (pathname.startsWith("/teacher")) {
    if (!token || token.role !== "teacher") {
      return NextResponse.redirect(new URL("/teacher/login", req.url))
    }
  }

  // Protect student routes
  if (pathname.startsWith("/student")) {
    if (!token || token.role !== "student") {
      return NextResponse.redirect(new URL("/student/auth", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/teacher/:path*", "/student/:path*"],
}
