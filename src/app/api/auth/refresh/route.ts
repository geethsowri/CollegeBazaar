import { dbConnect } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { readRefreshCookie, setAuthCookies } from "@/lib/auth/cookies";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/lib/auth/jwt";
import { fail, handle, ok } from "@/lib/utils/api";

export async function POST() {
  try {
    const token = await readRefreshCookie();
    if (!token) return fail("no_refresh", 401);
    const payload = await verifyRefreshToken(token);
    await dbConnect();
    const user = await User.findById(payload.sub);
    if (!user || user.isBanned || user.tokenVersion !== (payload.v ?? 0)) {
      return fail("refresh_invalid", 401);
    }
    const p = { sub: String(user._id), email: user.email, role: user.role, v: user.tokenVersion };
    const access = await signAccessToken(p);
    const refresh = await signRefreshToken(p);
    await setAuthCookies(access, refresh);
    return ok({ refreshed: true });
  } catch (e) {
    return handle(e);
  }
}
