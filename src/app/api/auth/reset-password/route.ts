import { dbConnect } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { verifyOtp } from "@/lib/auth/otp";
import { hashPassword } from "@/lib/auth/password";
import { resetSchema } from "@/lib/validators/auth";
import { fail, handle, ok } from "@/lib/utils/api";

export async function POST(req: Request) {
  try {
    const body = resetSchema.parse(await req.json());
    const v = await verifyOtp(body.email, body.code, "reset_password");
    if (!v.ok) return fail(v.reason, 400);
    await dbConnect();
    const user = await User.findOne({ email: body.email });
    if (!user) return fail("user_not_found", 404);
    user.passwordHash = await hashPassword(body.password);
    user.tokenVersion += 1; // invalidate refresh tokens
    await user.save();
    return ok({ reset: true });
  } catch (e) {
    return handle(e);
  }
}
