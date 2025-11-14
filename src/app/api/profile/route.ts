import { dbConnect } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { fail, handle, ok } from "@/lib/utils/api";
import { requireSession } from "@/lib/auth/session";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  branch: z.string().max(40).optional(),
  year: z.number().int().min(1).max(6).optional(),
  phone: z.string().max(20).optional(),
  residence: z.enum(["hosteller", "day_scholar", ""]).optional(),
  avatarUrl: z.string().url().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).max(128),
});

export async function GET() {
  try {
    const session = await requireSession();
    await dbConnect();
    const user = await User.findById(session.id)
      .select("-passwordHash -tokenVersion")
      .lean();
    if (!user) return fail("not_found", 404);
    return ok({ user });
  } catch (e) {
    return handle(e);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireSession();
    const body = updateSchema.parse(await req.json());
    await dbConnect();
    const user = await User.findByIdAndUpdate(
      session.id,
      { $set: body },
      { new: true, runValidators: true }
    ).select("-passwordHash -tokenVersion");
    if (!user) return fail("not_found", 404);
    return ok({ user });
  } catch (e) {
    return handle(e);
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireSession();
    const { currentPassword, newPassword } = changePasswordSchema.parse(await req.json());
    await dbConnect();
    const user = await User.findById(session.id);
    if (!user) return fail("not_found", 404);
    const match = await verifyPassword(currentPassword, user.passwordHash);
    if (!match) return fail("wrong_password", 401);
    user.passwordHash = await hashPassword(newPassword);
    user.tokenVersion = (user.tokenVersion ?? 0) + 1; // invalidate all existing tokens
    await user.save();
    return ok({ message: "password_changed" });
  } catch (e) {
    return handle(e);
  }
}
