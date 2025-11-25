import { dbConnect } from "@/lib/db/mongoose";
import { Wishlist } from "@/models/Wishlist";
import { requireSession } from "@/lib/auth/session";
import { fail, handle, ok } from "@/lib/utils/api";
import { z } from "zod";

const schema = z.object({ listingId: z.string() });

export async function GET() {
  try {
    const session = await requireSession();
    await dbConnect();
    const wishlist = await Wishlist.find({ user: session.id })
      .populate({
        path: "listing",
        match: { status: "active" }, // only show active listings
        populate: { path: "seller", select: "name avatarUrl" },
      })
      .sort({ createdAt: -1 })
      .lean();

    // Filter out entries where listing was removed/sold
    const active = wishlist.filter((w) => w.listing != null);
    return ok({ wishlist: active });
  } catch (e) {
    return handle(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const { listingId } = schema.parse(await req.json());
    await dbConnect();

    const existing = await Wishlist.findOne({ user: session.id, listing: listingId });
    if (existing) {
      // Toggle: remove if already wishlisted
      await Wishlist.deleteOne({ _id: existing._id });
      return ok({ wishlisted: false });
    }

    const count = await Wishlist.countDocuments({ user: session.id });
    if (count >= 100) return fail("wishlist_limit_reached", 400);

    await Wishlist.create({ user: session.id, listing: listingId });
    return ok({ wishlisted: true });
  } catch (e) {
    return handle(e);
  }
}
