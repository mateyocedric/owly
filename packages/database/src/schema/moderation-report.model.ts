import mongoose, { type Document, Schema, type Types } from "mongoose";

export const REPORT_CATEGORIES = [
  "spam",
  "scam",
  "sexual_exploitation",
  "threats",
  "hate_speech",
  "doxxing",
  "personal_info_request",
  "harassment",
  "underage",
  "other",
] as const;
export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

export const REPORT_STATUSES = [
  "pending",
  "reviewing",
  "resolved",
  "dismissed",
] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export interface IMessageContext {
  sender: "self" | "partner";
  content: string;
  timestamp: Date;
}

export interface IModerationReport extends Document {
  _id: Types.ObjectId;
  reporterSessionId: Types.ObjectId;
  reportedSessionId: Types.ObjectId;
  roomId: Types.ObjectId;
  category: ReportCategory;
  description?: string;
  messageContext: IMessageContext[];
  status: ReportStatus;
  resolvedAt?: Date;
  resolvedBy?: Types.ObjectId;
  createdAt: Date;
}

const moderationReportSchema = new Schema<IModerationReport>(
  {
    reporterSessionId: {
      type: Schema.Types.ObjectId,
      ref: "AnonymousSession",
      required: true,
      index: true,
    },
    reportedSessionId: {
      type: Schema.Types.ObjectId,
      ref: "AnonymousSession",
      required: true,
      index: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
    },
    category: {
      type: String,
      enum: REPORT_CATEGORIES,
      required: true,
    },
    description: { type: String },
    messageContext: [
      {
        sender: { type: String, enum: ["self", "partner"], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, required: true },
      },
    ],
    status: {
      type: String,
      enum: REPORT_STATUSES,
      default: "pending",
      required: true,
      index: true,
    },
    resolvedAt: { type: Date },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

moderationReportSchema.index({ status: 1, createdAt: -1 });

export const ModerationReport = mongoose.model<IModerationReport>(
  "ModerationReport",
  moderationReportSchema
);
