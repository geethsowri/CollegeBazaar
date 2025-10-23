import { dbConnect } from "@/lib/db/mongoose";
import { Order } from "@/models/Order";
import { Listing } from "@/models/Listing";
import { verifyRazorpaySignature } from "@/lib/services/razorpay";
import { requireSession } from "@/lib/auth/session";
import { fail, handle, ok } from "@/lib/utils/api";
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
    });
    if (!order) return fail("order_not_found", 404);
    order.status = "paid";
    order.razorpayPaymentId = body.razorpayPaymentId;
    order.razorpaySignature = body.razorpaySignature;
    await order.save();

    await Listing.updateOne(
      { _id: order.listing },
      { status: "sold", soldTo: order.buyer, soldAt: new Date() }
    );

    return ok({ orderId: String(order._id), status: "paid" });
  } catch (e) {
    return handle(e);
  }
}
