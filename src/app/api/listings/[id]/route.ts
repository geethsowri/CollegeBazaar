import { dbConnect } from "@/lib/db/mongoose";
import { Listing } from "@/models/Listing";
import { listingUpdateSchema } from "@/lib/validators/listing";
import { requireSession } from "@/lib/auth/session";
import { fail, handle, ok } from "@/lib/utils/api";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    await dbConnect();
    const listing = await Listing.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate("seller", "name avatarUrl branch year phone ratingSum ratingCount createdAt")
      .lean();
    if (!listing) return fail("not_found", 404);
    return ok({ listing });
  } catch (e) {
    return handle(e);
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await ctx.params;
    const body = listingUpdateSchema.parse(await req.json());
    await dbConnect();
    const listing = await Listing.findById(id);
    if (!listing) return fail("not_found", 404);
    if (String(listing.seller) !== session.id && session.role !== "admin")
      return fail("forbidden", 403);
    Object.assign(listing, body);
    await listing.save();
    return ok({ listing });
  } catch (e) {
    return handle(e);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await ctx.params;
    await dbConnect();
    const listing = await Listing.findById(id);
    if (!listing) return fail("not_found", 404);
    if (String(listing.seller) !== session.id && session.role !== "admin")
      return fail("forbidden", 403);
    listing.status = "removed";
    await listing.save();
    return ok({ deleted: true });
  } catch (e) {
    return handle(e);
  }
}
