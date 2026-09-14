import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("x-aureon-path", request.nextUrl.pathname);
  response.headers.set("x-aureon-stack", "next-app-router");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|media/|.*\\..*).*)"],
};
