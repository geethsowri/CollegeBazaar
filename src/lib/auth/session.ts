import { dbConnect } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { verifyAccessToken } from "./jwt";
import { readAccessCookie } from "./cookies";
import type { JwtPayload, Role } from "@/types";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  emailVerified: boolean;
  avatarUrl?: string;
}

export async function getSession(): Promise<SessionUser | null> {
  const token = await readAccessCookie();
  if (!token) return null;
  try {
    const payload = (await verifyAccessToken(token)) as JwtPayload;
    await dbConnect();
    const u = await User.findById(payload.sub).lean();
    if (!u || u.isBanned) return null;
    return {
      id: String(u._id),
      email: u.email,
      name: u.name,
      role: u.role as Role,
      emailVerified: u.emailVerified,
      avatarUrl: u.avatarUrl,
    };
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<SessionUser> {
  const s = await getSession();
  if (!s) throw new AuthError("unauthenticated", 401);
  return s;
}

export async function requireAdmin(): Promise<SessionUser> {
  const s = await requireSession();
  if (s.role !== "admin") throw new AuthError("forbidden", 403);
  return s;
}

export class AuthError extends Error {
  constructor(msg: string, public status: number) {
    super(msg);
  }
}
