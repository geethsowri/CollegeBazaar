import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ["user", "admin"], default: "user", index: true },
    emailVerified: { type: Boolean, default: false, index: true },

    branch: { type: String, default: "" },
    year: { type: Number, min: 1, max: 6, default: null },
    phone: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    residence: { type: String, enum: ["hosteller", "day_scholar", ""], default: "" },

    tokenVersion: { type: Number, default: 0 },
    isBanned: { type: Boolean, default: false, index: true },
    bannedReason: { type: String, default: "" },

    ratingSum: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

UserSchema.virtual("rating").get(function (this: any) {
  return this.ratingCount > 0 ? this.ratingSum / this.ratingCount : 0;
});

UserSchema.set("toJSON", { virtuals: true });

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: string };
export const User: Model<UserDoc> =
  (models.User as Model<UserDoc>) || model<UserDoc>("User", UserSchema);
