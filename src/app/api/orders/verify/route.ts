import { dbConnect } from "@/lib/db/mongoose";
import { Order } from "@/models/Order";
import { Listing } from "@/models/Listing";
import { verifyRazorpaySignature } from "@/lib/services/razorpay";
import { requireSession } from "@/lib/auth/session";
import { fail, handle, ok } from "@/lib/utils/api";
import { createNotification } from "@/lib/services/notifications";
import { z } from "zod";

const schema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const body = schema.parse(await req.json());
    const valid = verifyRazorpaySignature({
      orderId: body.razorpayOrderId,
      paymentId: body.razorpayPaymentId,
      signature: body.razorpaySignature,
    });
    if (!valid) return fail("signature_invalid", 400);

    await dbConnect();
    const order = await Order.findOne({
      razorpayOrderId: body.razorpayOrderId,
      buyer: session.id,
    }).populate("listing", "title");
    if (!order) return fail("order_not_found", 404);
    if (order.status !== "created") return fail("order_already_processed", 409);

    order.status = "paid";
    order.razorpayPaymentId = body.razorpayPaymentId;
    order.razorpaySignature = body.razorpaySignature;
    await order.save();

    await Listing.updateOne(
      { _id: order.listing },
      { status: "sold", soldTo: order.buyer, soldAt: new Date() }
    );

    const listingTitle = (order.listing as any)?.title ?? "your item";

    // Notify buyer
    await createNotification({
      userId: String(order.buyer),
      type: "order_paid",
      title: "Payment successful",
      body: `Your order for "${listingTitle}" has been confirmed.`,
      href: `/orders`,
      refId: String(order._id),
      refModel: "Order",
    });

    // Notify seller
    await createNotification({
      userId: String(order.seller),
      type: "listing_sold",
      title: "Your listing was sold!",
      body: `"${listingTitle}" has been purchased. Coordinate delivery with the buyer.`,
      href: `/orders`,
      refId: String(order._id),
      refModel: "Order",
    });

    return ok({ orderId: String(order._id), status: "paid" });
  } catch (e) {
    return handle(e);
  }
}
