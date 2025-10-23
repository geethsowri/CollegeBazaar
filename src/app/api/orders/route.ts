import { dbConnect } from "@/lib/db/mongoose";
import { Order } from "@/models/Order";
import { requireSession } from "@/lib/auth/session";
import { handle, ok } from "@/lib/utils/api";

export async function GET(req: Request) {
  try {
    const session = await requireSession();
    const url = new URL(req.url);
    const role = url.searchParams.get("role") ?? "buyer";
    await dbConnect();
    const query = role === "seller" ? { seller: session.id } : { buyer: session.id };
    const orders = await Order.find(query)
      .populate("listing")
      .populate("buyer", "name avatarUrl email")
      .populate("seller", "name avatarUrl email")
      .sort({ createdAt: -1 })
      .lean();
    return ok({ orders });
  } catch (e) {
    return handle(e);
  }
}
