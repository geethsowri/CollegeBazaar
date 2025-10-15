import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const ListingSchema = new Schema(
  {
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, maxlength: 2000 },
    category: {
      type: String,
      enum: ["mini_drafter", "calculator", "lab_apron"],
      required: true,
      index: true,
    },
    condition: {
      type: String,
      enum: ["like_new", "good", "average"],
      required: true,
      index: true,
    },
    images: { type: [String], default: [], validate: (v: string[]) => v.length > 0 && v.length <= 6 },
    originalPrice: { type: Number, required: true, min: 1 },
    sellingPrice: { type: Number, required: true, min: 1, index: true },
    branchRelevance: { type: [String], default: [] }, // e.g. ["CSE","ME"]
    yearRelevance: { type: [Number], default: [] },
    contactPhone: { type: String, default: "" },

    status: {
      type: String,
      enum: ["active", "sold", "removed", "flagged", "pending"],
      default: "active",
      index: true,
    },
    views: { type: Number, default: 0 },
    reportCount: { type: Number, default: 0, index: true },
    soldTo: { type: Schema.Types.ObjectId, ref: "User", default: null },
    soldAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ListingSchema.index({ title: "text", description: "text" });
ListingSchema.index({ status: 1, createdAt: -1 });

export type ListingDoc = InferSchemaType<typeof ListingSchema> & { _id: string };
export const Listing: Model<ListingDoc> =
  (models.Listing as Model<ListingDoc>) || model<ListingDoc>("Listing", ListingSchema);
