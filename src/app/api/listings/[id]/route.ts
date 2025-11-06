import { dbConnect } from "@/lib/db/mongoose";
import { Listing } from "@/models/Listing";
import { requireSession } from "@/lib/auth/session";
import { fail, handle, ok } from "@/lib/utils/api";
import { listingUpdateSchema } from "@/lib/validators/listing";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const listing = await Listing.findById(id)
      .populate("seller", "name avatarUrl branch year ratingSum ratingCount")
      .lean();
    if (!listing) return fail("not_found", 404);

    // Increment view count asynchronously (fire and forget)
    Listing.updateOne({ _id: id }, { $inc: { views: 1 } }).catch(() => null);

    return ok({ listing });
  } catch (e) {
    return handle(e);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireSession();
    const body = listingUpdateSchema.parse(await req.json());
    await dbConnect();
    const listing = await Listing.findById(id);
    if (!listing) return fail("not_found", 404);
    if (String(listing.seller) !== session.id && session.role !== "admin")
      return fail("forbidden", 403);
    if (listing.status === "sold") return fail("listing_already_sold", 400);
    Object.assign(listing, body);
    await listing.save();
    return ok({ listing });
  } catch (e) {
    return handle(e);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireSession();
    await dbConnect();
    const listing = await Listing.findById(id);
    if (!listing) return fail("not_found", 404);
    if (String(listing.seller) !== session.id && session.role !== "admin")
      return fail("forbidden", 403);
    if (listing.status === "sold") return fail("cannot_delete_sold", 400);
    listing.status = "removed";
    await listing.save();
    return ok({ message: "listing_removed" });
  } catch (e) {
    return handle(e);
  }
}
