import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "kickoff_session";
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "kickoff-dev-secret-change-in-production-32",
);

const protectedPrefixes = [
  "/league",
  "/club",
  "/referee",
  "/guardian",
  "/platform",
  "/settings",
];

async function requireAuth(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  try {
    await jwtVerify(token, secret);
    return null;
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const orgRewrite = pathname.match(/^\/o\/([^/]+)\/league(\/.*)?$/);
  if (orgRewrite) {
    const denied = await requireAuth(request);
    if (denied) return denied;
    const url = request.nextUrl.clone();
    url.pathname = `/league${orgRewrite[2] ?? "/dashboard"}`;
    const res = NextResponse.rewrite(url);
    res.cookies.set("kickoff_org_slug", orgRewrite[1], { path: "/" });
    return res;
  }

  if (!protectedPrefixes.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const denied = await requireAuth(request);
  if (denied) return denied;
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/league/:path*",
    "/club/:path*",
    "/referee/:path*",
    "/guardian/:path*",
    "/platform/:path*",
    "/settings/:path*",
    "/o/:orgSlug/league/:path*",
  ],
};
