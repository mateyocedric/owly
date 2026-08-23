import mongoose, { type Document, Schema, type Types } from "mongoose";

export interface IUserBlock extends Document {
  _id: Types.ObjectId;
  blockerSessionId: Types.ObjectId;
  blockedSessionId: Types.ObjectId;
  createdAt: Date;
}

const userBlockSchema = new Schema<IUserBlock>(
  {
    blockerSessionId: {
      type: Schema.Types.ObjectId,
      ref: "AnonymousSession",
      required: true,
    },
    blockedSessionId: {
      type: Schema.Types.ObjectId,
      ref: "AnonymousSession",
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

userBlockSchema.index(
  { blockerSessionId: 1, blockedSessionId: 1 },
  { unique: true }
);
userBlockSchema.index({ blockedSessionId: 1 });

export const UserBlock = mongoose.model<IUserBlock>(
  "UserBlock",
  userBlockSchema
);
