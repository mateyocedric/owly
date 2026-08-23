import mongoose, { type Document, Schema, type Types } from "mongoose";

export interface IBanRecord extends Document {
  _id: Types.ObjectId;
  ipHash: string;
  sessionId?: Types.ObjectId;
  reason: string;
  bannedBy: Types.ObjectId;
  type: "temporary" | "permanent";
  expiresAt?: Date;
  createdAt: Date;
}

const banRecordSchema = new Schema<IBanRecord>(
  {
    ipHash: {
      type: String,
      required: true,
      index: true,
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "AnonymousSession",
    },
    reason: { type: String, required: true },
    bannedBy: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
      required: true,
    },
    type: {
      type: String,
      enum: ["temporary", "permanent"],
      required: true,
    },
    expiresAt: { type: Date },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

banRecordSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const BanRecord = mongoose.model<IBanRecord>(
  "BanRecord",
  banRecordSchema
);
