import { dbConnect } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { requireAdmin } from "@/lib/auth/session";
import { fail, handle, ok } from "@/lib/utils/api";
import { z } from "zod";

const patchSchema = z.object({
  id: z.string(),
  isBanned: z.boolean().optional(),
  bannedReason: z.string().max(500).optional(),
  role: z.enum(["user", "admin"]).optional(),
});

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const q = url.searchParams.get("q");
    await dbConnect();
    const filter = q
      ? { $or: [{ email: new RegExp(q, "i") }, { name: new RegExp(q, "i") }] }
      : {};
    const items = await User.find(filter)
      .select("-passwordHash -tokenVersion")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return ok({ items });
  } catch (e) {
    return handle(e);
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    const body = patchSchema.parse(await req.json());
    await dbConnect();
    const update: Record<string, unknown> = {};
    if (body.isBanned !== undefined) update.isBanned = body.isBanned;
    if (body.bannedReason !== undefined) update.bannedReason = body.bannedReason;
    if (body.role !== undefined) update.role = body.role;
    if (body.isBanned) update.$inc = { tokenVersion: 1 };
    const user = await User.findByIdAndUpdate(body.id, update, { new: true })
      .select("-passwordHash")
      .lean();
    if (!user) return fail("not_found", 404);
    return ok({ user });
  } catch (e) {
    return handle(e);
  }
}
