import { dbConnect } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { issueOtp } from "@/lib/auth/otp";
import { requestResetSchema } from "@/lib/validators/auth";
import { handle, ok } from "@/lib/utils/api";

export async function POST(req: Request) {
  try {
    const body = requestResetSchema.parse(await req.json());
    await dbConnect();
    const user = await User.findOne({ email: body.email });
    // Always respond ok so we don't leak emails
    if (user) await issueOtp(body.email, "reset_password");
    return ok({ sent: true });
  } catch (e) {
    return handle(e);
  }
}
