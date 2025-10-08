import { cookies } from "next/headers";
import { TOKEN_TTL } from "./jwt";

export const ACCESS_COOKIE = "cb_access";
export const REFRESH_COOKIE = "cb_refresh";

const baseOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function setAuthCookies(access: string, refresh: string) {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, access, { ...baseOpts, maxAge: TOKEN_TTL.access });
  jar.set(REFRESH_COOKIE, refresh, { ...baseOpts, maxAge: TOKEN_TTL.refresh });
}

export async function clearAuthCookies() {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, "", { ...baseOpts, maxAge: 0 });
  jar.set(REFRESH_COOKIE, "", { ...baseOpts, maxAge: 0 });
}

export async function readAccessCookie() {
  return (await cookies()).get(ACCESS_COOKIE)?.value ?? null;
}

export async function readRefreshCookie() {
  return (await cookies()).get(REFRESH_COOKIE)?.value ?? null;
}
