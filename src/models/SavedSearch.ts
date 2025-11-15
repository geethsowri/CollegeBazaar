import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const SavedSearchSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    label: { type: String, required: true, maxlength: 60 },
    /** Serialized query params, e.g. category=calculator&minPrice=100 */
    query: { type: String, required: true },
    /** Last time the user was alerted about new results */
    lastAlertedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

SavedSearchSchema.index({ user: 1, createdAt: -1 });

export type SavedSearchDoc = InferSchemaType<typeof SavedSearchSchema> & { _id: string };
export const SavedSearch: Model<SavedSearchDoc> =
  (models.SavedSearch as Model<SavedSearchDoc>) ||
  model<SavedSearchDoc>("SavedSearch", SavedSearchSchema);
