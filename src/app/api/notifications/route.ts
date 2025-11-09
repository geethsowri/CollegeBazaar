import { dbConnect } from "@/lib/db/mongoose";
import { Notification } from "@/models/Notification";
import { requireSession } from "@/lib/auth/session";
import { handle, ok } from "@/lib/utils/api";
import { z } from "zod";

const listSchema = z.object({
  unreadOnly: z.coerce.boolean().default(false),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  skip: z.coerce.number().int().min(0).default(0),
});

export async function GET(req: Request) {
  try {
    const session = await requireSession();
    const url = new URL(req.url);
    const { unreadOnly, limit, skip } = listSchema.parse(
      Object.fromEntries(url.searchParams)
    );

    await dbConnect();
    const filter: Record<string, unknown> = { user: session.id };
    if (unreadOnly) filter.read = false;

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
    ]);

    const unreadCount = await Notification.countDocuments({ user: session.id, read: false });
    return ok({ notifications, total, unreadCount });
  } catch (e) {
    return handle(e);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireSession();
    const body = await req.json().catch(() => ({}));
    const ids: string[] | null = Array.isArray(body.ids) ? body.ids : null;

    await dbConnect();
    if (ids && ids.length > 0) {
      // Mark specific notifications as read
      await Notification.updateMany(
        { _id: { $in: ids }, user: session.id },
        { $set: { read: true } }
      );
    } else {
      // Mark all as read
      await Notification.updateMany({ user: session.id, read: false }, { $set: { read: true } });
    }
    return ok({ message: "marked_read" });
  } catch (e) {
    return handle(e);
  }
}
