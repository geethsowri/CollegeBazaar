import { dbConnect } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { requireAdmin } from "@/lib/auth/session";
import { handle, ok, fail } from "@/lib/utils/api";
import { z } from "zod";

const actionSchema = z.object({
  action: z.enum(["ban", "unban", "make_admin", "revoke_admin"]),
  reason: z.string().max(300).default(""),
});

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 100);
    const skip = Number(url.searchParams.get("skip") ?? 0);
    await dbConnect();
    const filter = q
      ? { $or: [{ name: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }] }
      : {};
    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-passwordHash -tokenVersion")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);
    return ok({ users, total });
  } catch (e) {
    return handle(e);
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return fail("id_required", 400);
    const { action, reason } = actionSchema.parse(await req.json());
    await dbConnect();

    const updates: Record<string, unknown> = {};
    if (action === "ban") { updates.isBanned = true; updates.bannedReason = reason; updates.tokenVersion = { $add: 1 }; }
    if (action === "unban") { updates.isBanned = false; updates.bannedReason = ""; }
    if (action === "make_admin") updates.role = "admin";
    if (action === "revoke_admin") updates.role = "user";

    // Use $set for most, handle $inc separately
    const setFields = { ...updates };
    const incFields: Record<string, unknown> = {};
    if (updates["tokenVersion"]) { incFields.tokenVersion = 1; delete setFields["tokenVersion"]; }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: setFields, ...(Object.keys(incFields).length ? { $inc: incFields } : {}) },
      { new: true }
    ).select("-passwordHash -tokenVersion");

    if (!user) return fail("not_found", 404);
    return ok({ user, action });
  } catch (e) {
    return handle(e);
  }
}
