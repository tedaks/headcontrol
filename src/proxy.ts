import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "headscale_api_key";

export function proxy(request: NextRequest) {
  const apiKey = request.cookies.get(COOKIE_NAME)?.value;
  const isLoginPage = request.nextUrl.pathname === "/login";
  const isApiRoute = request.nextUrl.pathname.startsWith("/api/");

  if (isApiRoute) return NextResponse.next();

  if (!apiKey && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (apiKey && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
