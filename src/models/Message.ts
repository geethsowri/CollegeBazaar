import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const MessageSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    body: { type: String, required: true, maxlength: 2000 },
    readBy: { type: [{ type: Schema.Types.ObjectId, ref: "User" }], default: [] },
  },
  { timestamps: true }
);

MessageSchema.index({ conversation: 1, createdAt: -1 });

export type MessageDoc = InferSchemaType<typeof MessageSchema> & { _id: string };
export const Message: Model<MessageDoc> =
  (models.Message as Model<MessageDoc>) || model<MessageDoc>("Message", MessageSchema);
