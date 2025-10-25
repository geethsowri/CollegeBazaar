import { dbConnect } from "@/lib/db/mongoose";
import { Listing } from "@/models/Listing";
import { requireAdmin } from "@/lib/auth/session";
import { fail, handle, ok } from "@/lib/utils/api";
import { z } from "zod";

const patchSchema = z.object({
  id: z.string(),
  status: z.enum(["active", "removed", "flagged", "pending"]),
});

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    await dbConnect();
    const items = await Listing.find(status ? { status } : {})
      .populate("seller", "name email avatarUrl")
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
    const listing = await Listing.findByIdAndUpdate(body.id, { status: body.status }, { new: true });
    if (!listing) return fail("not_found", 404);
    return ok({ listing });
  } catch (e) {
    return handle(e);
  }
}
