// src/middleware.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  
  // If user is not signed in, redirect to sign-in page
  if (!token) {
    return NextResponse.redirect(new URL("/auth/sign-in", req.url));
  }
  
  return NextResponse.next();
}

// Only run middleware on the homepage and dashboard
export const config = {
  matcher: ['/', '/profile/:path*'],
};