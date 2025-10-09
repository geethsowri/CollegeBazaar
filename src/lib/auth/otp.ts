import bcrypt from "bcryptjs";
import { Otp } from "@/models/Otp";
import { sendMail } from "@/lib/services/mail";

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function issueOtp(
  email: string,
  purpose: "verify_email" | "reset_password"
) {
  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  await Otp.deleteMany({ email, purpose });
  await Otp.create({
    email,
    codeHash,
    purpose,
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  });
  await sendMail({
    to: email,
    subject:
      purpose === "verify_email"
        ? "Verify your College Bazaar account"
        : "Reset your College Bazaar password",
    html: `<div style="font-family:Inter,system-ui,sans-serif;max-width:520px;margin:auto;padding:32px;border:1px solid #eee;border-radius:14px">
      <h2 style="margin:0 0 8px">College Bazaar</h2>
      <p style="color:#555">Your one-time code:</p>
      <p style="font-size:36px;font-weight:700;letter-spacing:8px">${code}</p>
      <p style="color:#888;font-size:13px">Valid for 10 minutes. Do not share it.</p>
    </div>`,
  });
}

export async function verifyOtp(
  email: string,
  code: string,
  purpose: "verify_email" | "reset_password"
) {
  const otp = await Otp.findOne({ email, purpose });
  if (!otp) return { ok: false as const, reason: "expired" };
  if (otp.attempts >= OTP_MAX_ATTEMPTS) {
    await Otp.deleteOne({ _id: otp._id });
    return { ok: false as const, reason: "too_many_attempts" };
  }
  const match = await bcrypt.compare(code, otp.codeHash);
  if (!match) {
    otp.attempts += 1;
    await otp.save();
    return { ok: false as const, reason: "invalid" };
  }
  await Otp.deleteOne({ _id: otp._id });
  return { ok: true as const };
}
