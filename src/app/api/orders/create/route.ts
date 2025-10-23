import { dbConnect } from "@/lib/db/mongoose";
import { Listing } from "@/models/Listing";
import { Order } from "@/models/Order";
import { razorpay } from "@/lib/services/razorpay";
import { requireSession } from "@/lib/auth/session";
import { fail, handle, ok } from "@/lib/utils/api";
import { z } from "zod";

const schema = z.object({ listingId: z.string() });

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const { listingId } = schema.parse(await req.json());
    await dbConnect();
    const listing = await Listing.findById(listingId);
    if (!listing) return fail("listing_not_found", 404);
    if (listing.status !== "active") return fail("listing_not_available", 400);
    if (String(listing.seller) === session.id) return fail("cannot_buy_own", 400);

    const rzpOrder = await razorpay.orders.create({
      amount: listing.sellingPrice * 100,
      currency: "INR",
      receipt: `cb_${listing._id.toString().slice(-10)}_${Date.now()}`,
      notes: { listingId: String(listing._id), buyerId: session.id },
    });

    const order = await Order.create({
      buyer: session.id,
      seller: listing.seller,
      listing: listing._id,
      amount: listing.sellingPrice,
      razorpayOrderId: rzpOrder.id,
      status: "created",
    });

    return ok({
      orderId: String(order._id),
      razorpayOrderId: rzpOrder.id,
      amount: listing.sellingPrice,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (e) {
    return handle(e);
  }
}
