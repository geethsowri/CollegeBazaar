import { dbConnect } from "@/lib/db/mongoose";
import { Review } from "@/models/Review";
import { requireSession } from "@/lib/auth/session";
import { fail, handle, ok } from "@/lib/utils/api";
import { z } from "zod";

const listSchema = z.object({
  userId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  skip: z.coerce.number().int().min(0).default(0),
});

const createSchema = z.object({
  orderId: z.string(),
  revieweeId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).default(""),
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const { userId, limit, skip } = listSchema.parse(Object.fromEntries(url.searchParams));
    await dbConnect();
    const filter = userId ? { reviewee: userId } : {};
    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("reviewer", "name avatarUrl")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
    ]);
    return ok({ reviews, total });
  } catch (e) {
    return handle(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const { orderId, revieweeId, rating, comment } = createSchema.parse(await req.json());

    // Verify the order belongs to this buyer and is completed
    const { Order } = await import("@/models/Order");
    await dbConnect();
    const order = await Order.findById(orderId);
    if (!order) return fail("order_not_found", 404);
    if (String(order.buyer) !== session.id) return fail("forbidden", 403);
    if (order.status !== "completed") return fail("order_not_completed", 400);

    const existing = await Review.findOne({ order: orderId });
    if (existing) return fail("already_reviewed", 409);

    const review = await Review.create({
      reviewer: session.id,
      reviewee: revieweeId,
      order: orderId,
      rating,
      comment,
    });

    // Update aggregate rating on User
    const { User } = await import("@/models/User");
    await User.findByIdAndUpdate(revieweeId, {
      $inc: { ratingSum: rating, ratingCount: 1 },
    });

    return ok({ review }, 201);
  } catch (e) {
    return handle(e);
  }
}
