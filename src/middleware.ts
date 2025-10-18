import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ACCESS = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);

const PROTECTED = [/^\/dashboard/, /^\/sell/, /^\/wishlist/, /^\/messages/, /^\/orders/, /^\/profile/];
const ADMIN_ONLY = [/^\/admin/];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED.some((r) => r.test(pathname));
  const isAdmin = ADMIN_ONLY.some((r) => r.test(pathname));
  if (!isProtected && !isAdmin) return NextResponse.next();

  const token = req.cookies.get("cb_access")?.value;
  if (!token) return redirectToLogin(req);

  try {
    const { payload } = await jwtVerify(token, ACCESS);
    if (isAdmin && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
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
  matcher: ["/dashboard/:path*", "/sell/:path*", "/wishlist/:path*", "/messages/:path*", "/orders/:path*", "/profile/:path*", "/admin/:path*"],
};
