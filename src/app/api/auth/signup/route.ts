import { dbConnect } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/auth/password";
import { issueOtp } from "@/lib/auth/otp";
import { isCollegeEmail } from "@/lib/auth/college";
import { signupSchema } from "@/lib/validators/auth";
import { fail, handle, ok } from "@/lib/utils/api";

export async function POST(req: Request) {
  try {
    const body = signupSchema.parse(await req.json());
    if (!isCollegeEmail(body.email)) return fail("not_a_college_email", 400);
    await dbConnect();
    const existing = await User.findOne({ email: body.email }).lean();
    if (existing) return fail("email_taken", 409);
    const passwordHash = await hashPassword(body.password);
    await User.create({
      email: body.email,
      passwordHash,
      name: body.name,
      emailVerified: false,
    });
    await issueOtp(body.email, "verify_email");
    return ok({ email: body.email, next: "verify-otp" });
  } catch (e) {
    return handle(e);
  }
}
