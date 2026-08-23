import mongoose, { type Document, Schema, type Types } from "mongoose";

export const ACTION_TYPES = [
  "warning",
  "temporary_ban",
  "permanent_ban",
  "unban",
  "dismiss_report",
] as const;
export type ActionType = (typeof ACTION_TYPES)[number];

export interface IModerationAction extends Document {
  _id: Types.ObjectId;
  targetSessionId: Types.ObjectId;
  reportId?: Types.ObjectId;
  actionType: ActionType;
  reason?: string;
  performedBy: Types.ObjectId;
  expiresAt?: Date;
  createdAt: Date;
}

const moderationActionSchema = new Schema<IModerationAction>(
  {
    targetSessionId: {
      type: Schema.Types.ObjectId,
      ref: "AnonymousSession",
      required: true,
      index: true,
    },
    reportId: {
      type: Schema.Types.ObjectId,
      ref: "ModerationReport",
    },
    actionType: {
      type: String,
      enum: ACTION_TYPES,
      required: true,
    },
    reason: { type: String },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
      required: true,
    },
    expiresAt: { type: Date },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const ModerationAction = mongoose.model<IModerationAction>(
  "ModerationAction",
  moderationActionSchema
);
