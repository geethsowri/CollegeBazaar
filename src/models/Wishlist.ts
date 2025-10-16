import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const WishlistSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
  },
  { timestamps: true }
);

WishlistSchema.index({ user: 1, listing: 1 }, { unique: true });

export type WishlistDoc = InferSchemaType<typeof WishlistSchema> & { _id: string };
export const Wishlist: Model<WishlistDoc> =
  (models.Wishlist as Model<WishlistDoc>) || model<WishlistDoc>("Wishlist", WishlistSchema);
