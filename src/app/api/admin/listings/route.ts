import { dbConnect } from "@/lib/db/mongoose";
import { Listing } from "@/models/Listing";
import { User } from "@/models/User";
import { requireAdmin } from "@/lib/auth/session";
import { handle, ok, fail } from "@/lib/utils/api";
import { z } from "zod";

const actionSchema = z.object({
  action: z.enum(["approve", "flag", "remove", "unflag"]),
  reason: z.string().max(300).optional(),
});

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const status = url.searchParams.get("status") ?? "active";
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 100);
    const skip = Number(url.searchParams.get("skip") ?? 0);
    await dbConnect();
    const [listings, total] = await Promise.all([
      Listing.find({ status })
        .populate("seller", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Listing.countDocuments({ status }),
    ]);
    return ok({ listings, total });
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
    const statusMap: Record<string, string> = {
      approve: "active",
      flag: "flagged",
      remove: "removed",
      unflag: "active",
    };
    const listing = await Listing.findByIdAndUpdate(
      id,
      { $set: { status: statusMap[action] } },
      { new: true }
    );
    if (!listing) return fail("not_found", 404);
    return ok({ listing, action, reason });
  } catch (e) {
    return handle(e);
  }
}
