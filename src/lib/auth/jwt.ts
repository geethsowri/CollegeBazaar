import { SignJWT, jwtVerify } from "jose";
import type { JwtPayload } from "@/types";

const enc = new TextEncoder();
const ACCESS = enc.encode(process.env.JWT_ACCESS_SECRET!);
const REFRESH = enc.encode(process.env.JWT_REFRESH_SECRET!);
const ACCESS_TTL = Number(process.env.JWT_ACCESS_TTL ?? 900);
const REFRESH_TTL = Number(process.env.JWT_REFRESH_TTL ?? 60 * 60 * 24 * 30);

export async function signAccessToken(payload: JwtPayload) {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL}s`)
    .sign(ACCESS);
}

export async function signRefreshToken(payload: JwtPayload) {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TTL}s`)
    .sign(REFRESH);
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, ACCESS);
  return payload as unknown as JwtPayload & { exp: number; iat: number };
}

export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify(token, REFRESH);
  return payload as unknown as JwtPayload & { exp: number; iat: number };
}

export const TOKEN_TTL = { access: ACCESS_TTL, refresh: REFRESH_TTL };
