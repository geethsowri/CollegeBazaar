import { dbConnect } from "@/lib/db/mongoose";
import { Order } from "@/models/Order";
import { requireSession } from "@/lib/auth/session";
import { fail, handle, ok } from "@/lib/utils/api";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  review: z.string().max(500).default(""),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireSession();
    const body = reviewSchema.parse(await req.json());

    await dbConnect();
    const order = await Order.findById(id);
    if (!order) return fail("order_not_found", 404);
    if (String(order.buyer) !== session.id) return fail("forbidden", 403);
    if (order.status !== "completed") return fail("order_not_completed", 400);
    if (order.rating != null) return fail("already_reviewed", 409);

    order.rating = body.rating;
    order.review = body.review;
    await order.save();

    // Update seller's aggregate rating
    const { User } = await import("@/models/User");
    await User.findByIdAndUpdate(order.seller, {
      $inc: { ratingSum: body.rating, ratingCount: 1 },
    });

    return ok({ message: "review_submitted" });
  } catch (e) {
    return handle(e);
  }
}
