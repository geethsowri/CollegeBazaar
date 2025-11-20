import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ACCESS = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);

const PROTECTED = [
  /^\/dashboard/,
  /^\/sell/,
  /^\/wishlist/,
  /^\/messages/,
  /^\/orders/,
  /^\/profile/,
  /^\/notifications/,
];
const ADMIN_ONLY = [/^\/admin/];
/** Routes that authenticated users should NOT visit (e.g. login while logged in) */
const AUTH_ONLY = [/^\/login/, /^\/signup/, /^\/forgot-password/, /^\/reset-password/];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED.some((r) => r.test(pathname));
  const isAdmin = ADMIN_ONLY.some((r) => r.test(pathname));
  const isAuthOnly = AUTH_ONLY.some((r) => r.test(pathname));

  const token = req.cookies.get("cb_access")?.value;

  // Already logged in → redirect away from auth-only pages
  if (isAuthOnly && token) {
    try {
      await jwtVerify(token, ACCESS);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } catch {
      // token invalid → let through to login page
    }
  }

  if (!isProtected && !isAdmin) return NextResponse.next();
  if (!token) return redirectToLogin(req);

  try {
    const { payload } = await jwtVerify(token, ACCESS);
    if (isAdmin && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    // Attach user id as a request header for downstream use
    const res = NextResponse.next();
    res.headers.set("x-user-id", String(payload.sub));
    res.headers.set("x-user-role", String(payload.role));
    return res;
  } catch {
    return redirectToLogin(req);
  }
}

function redirectToLogin(req: NextRequest) {
  const url = new URL("/login", req.url);
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/sell/:path*",
    "/wishlist/:path*",
    "/messages/:path*",
    "/orders/:path*",
    "/profile/:path*",
    "/notifications/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ],
};
