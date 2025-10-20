import { z } from "zod";
import { issueOtp } from "@/lib/auth/otp";
import { fail, handle, ok } from "@/lib/utils/api";

const schema = z.object({
  email: z.string().email().toLowerCase(),
  purpose: z.enum(["verify_email", "reset_password"]),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    await issueOtp(body.email, body.purpose);
    return ok({ sent: true });
  } catch (e) {
    return handle(e);
  }
}
