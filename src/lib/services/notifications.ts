import { Notification } from "@/models/Notification";
import { dbConnect } from "@/lib/db/mongoose";
import type { NotificationDoc } from "@/models/Notification";

export type NotifType = NotificationDoc["type"];

export async function createNotification(params: {
  userId: string;
  type: NotifType;
  title: string;
  body?: string;
  href?: string;
  refId?: string;
  refModel?: string;
}) {
  await dbConnect();
  return Notification.create({
    user: params.userId,
    type: params.type,
    title: params.title,
    body: params.body ?? "",
    href: params.href ?? "",
    refId: params.refId ?? null,
    refModel: params.refModel ?? "",
  });
}

export async function markAllRead(userId: string) {
  await dbConnect();
  return Notification.updateMany({ user: userId, read: false }, { $set: { read: true } });
}

export async function getUnreadCount(userId: string): Promise<number> {
  await dbConnect();
  return Notification.countDocuments({ user: userId, read: false });
}
