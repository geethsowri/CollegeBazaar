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
    const items = await Wishlist.find({ user: session.id })
      .populate({
        path: "listing",
        populate: { path: "seller", select: "name avatarUrl" },
      })
      .sort({ createdAt: -1 })
      .lean();
    return ok({ items });
  } catch (e) {
    return handle(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const { listingId } = schema.parse(await req.json());
    await dbConnect();
    await Wishlist.findOneAndUpdate(
      { user: session.id, listing: listingId },
      { user: session.id, listing: listingId },
      { upsert: true, new: true }
    );
    return ok({ added: true });
  } catch (e) {
    return handle(e);
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireSession();
    const url = new URL(req.url);
    const listingId = url.searchParams.get("listingId");
    if (!listingId) return fail("listingId_required", 400);
    await dbConnect();
    await Wishlist.deleteOne({ user: session.id, listing: listingId });
    return ok({ removed: true });
  } catch (e) {
    return handle(e);
  }
}
