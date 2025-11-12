import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const ReviewSchema = new Schema(
  {
    reviewer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    reviewee: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "", maxlength: 500 },
  },
  { timestamps: true }
);

ReviewSchema.index({ reviewee: 1, createdAt: -1 });

export type ReviewDoc = InferSchemaType<typeof ReviewSchema> & { _id: string };
export const Review: Model<ReviewDoc> =
  (models.Review as Model<ReviewDoc>) || model<ReviewDoc>("Review", ReviewSchema);
