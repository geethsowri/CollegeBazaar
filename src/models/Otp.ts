import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const OtpSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    codeHash: { type: String, required: true },
    purpose: { type: String, enum: ["verify_email", "reset_password"], required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

OtpSchema.index({ email: 1, purpose: 1 });

export type OtpDoc = InferSchemaType<typeof OtpSchema> & { _id: string };
export const Otp: Model<OtpDoc> =
  (models.Otp as Model<OtpDoc>) || model<OtpDoc>("Otp", OtpSchema);
