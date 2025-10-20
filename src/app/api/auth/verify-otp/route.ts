import { dbConnect } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { verifyOtp } from "@/lib/auth/otp";
import { otpSchema } from "@/lib/validators/auth";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { setAuthCookies } from "@/lib/auth/cookies";
import { fail, handle, ok } from "@/lib/utils/api";

export async function POST(req: Request) {
  try {
    const body = otpSchema.parse(await req.json());
    const result = await verifyOtp(body.email, body.code, "verify_email");
    if (!result.ok) return fail(result.reason, 400);
    await dbConnect();
    const user = await User.findOneAndUpdate(
      { email: body.email },
      { emailVerified: true },
      { new: true }
    );
    if (!user) return fail("user_not_found", 404);
    const payload = { sub: String(user._id), email: user.email, role: user.role, v: user.tokenVersion };
    const access = await signAccessToken(payload);
    const refresh = await signRefreshToken(payload);
    await setAuthCookies(access, refresh);
    return ok({ id: String(user._id), email: user.email, name: user.name });
  } catch (e) {
    return handle(e);
  }
}
