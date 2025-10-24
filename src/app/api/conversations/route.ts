import { dbConnect } from "@/lib/db/mongoose";
import { Conversation } from "@/models/Conversation";
import { Listing } from "@/models/Listing";
import { requireSession } from "@/lib/auth/session";
import { fail, handle, ok } from "@/lib/utils/api";
import { z } from "zod";

const schema = z.object({ listingId: z.string() });

export async function GET() {
  try {
    const session = await requireSession();
    await dbConnect();
    const items = await Conversation.find({ participants: session.id })
      .populate("participants", "name avatarUrl")
      .populate("listing", "title images sellingPrice status")
      .sort({ lastMessageAt: -1 })
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
    const listing = await Listing.findById(listingId);
    if (!listing) return fail("listing_not_found", 404);
    if (String(listing.seller) === session.id) return fail("cannot_chat_self", 400);

    const participants = [session.id, String(listing.seller)].sort();
    const convo = await Conversation.findOneAndUpdate(
      { participants, listing: listingId },
      { participants, listing: listingId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return ok({ conversation: convo });
  } catch (e) {
    return handle(e);
  }
}
