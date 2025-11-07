import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const NotificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: [
        "order_placed",
        "order_paid",
        "order_completed",
        "order_cancelled",
        "new_message",
        "listing_sold",
        "listing_flagged",
        "account_banned",
        "review_received",
      ],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, default: "" },
    /** Optional deep-link inside the app */
    href: { type: String, default: "" },
    read: { type: Boolean, default: false, index: true },
    /** Optional reference to a related entity */
    refId: { type: Schema.Types.ObjectId, default: null },
    refModel: { type: String, default: "" },
  },
  { timestamps: true }
);

NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });

export type NotificationDoc = InferSchemaType<typeof NotificationSchema> & { _id: string };
export const Notification: Model<NotificationDoc> =
  (models.Notification as Model<NotificationDoc>) ||
  model<NotificationDoc>("Notification", NotificationSchema);
