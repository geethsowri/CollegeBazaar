import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const ConversationSchema = new Schema(
  {
    participants: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      validate: (v: unknown[]) => v.length === 2,
      index: true,
    },
    listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now, index: true },
    unread: {
      type: Map,
      of: Number,
      default: new Map(),
    },
  },
  { timestamps: true }
);

ConversationSchema.index({ participants: 1, listing: 1 }, { unique: true });

export type ConversationDoc = InferSchemaType<typeof ConversationSchema> & { _id: string };
export const Conversation: Model<ConversationDoc> =
  (models.Conversation as Model<ConversationDoc>) ||
  model<ConversationDoc>("Conversation", ConversationSchema);
