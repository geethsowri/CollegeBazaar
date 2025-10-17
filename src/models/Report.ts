import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const ReportSchema = new Schema(
  {
    reporter: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    reason: {
      type: String,
      enum: ["spam", "fake", "inappropriate", "wrong_category", "other"],
      required: true,
    },
    details: { type: String, maxlength: 1000, default: "" },
    status: {
      type: String,
      enum: ["open", "resolved", "dismissed"],
      default: "open",
      index: true,
    },
    resolution: { type: String, default: "" },
  },
  { timestamps: true }
);

export type ReportDoc = InferSchemaType<typeof ReportSchema> & { _id: string };
export const Report: Model<ReportDoc> =
  (models.Report as Model<ReportDoc>) || model<ReportDoc>("Report", ReportSchema);
