import { dbConnect } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { verifyPassword } from "@/lib/auth/password";
import { loginSchema } from "@/lib/validators/auth";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { setAuthCookies } from "@/lib/auth/cookies";
import { fail, handle, ok } from "@/lib/utils/api";

export async function POST(req: Request) {
  try {
    const body = loginSchema.parse(await req.json());
    await dbConnect();
    const user = await User.findOne({ email: body.email });
    if (!user) return fail("invalid_credentials", 401);
    if (user.isBanned) return fail("account_banned", 403);
    const ok1 = await verifyPassword(body.password, user.passwordHash);
    if (!ok1) return fail("invalid_credentials", 401);
    if (!user.emailVerified) return fail("email_not_verified", 403);
    const payload = { sub: String(user._id), email: user.email, role: user.role, v: user.tokenVersion };
    const access = await signAccessToken(payload);
    const refresh = await signRefreshToken(payload);
    await setAuthCookies(access, refresh);
    return ok({ id: String(user._id), email: user.email, name: user.name, role: user.role });
  } catch (e) {
    return handle(e);
  }
}
