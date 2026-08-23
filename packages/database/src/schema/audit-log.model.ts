import mongoose, { type Document, Schema, type Types } from "mongoose";

export interface IAuditLog extends Document {
  _id: Types.ObjectId;
  action: string;
  performedBy: Types.ObjectId;
  targetType: "session" | "room" | "report" | "admin" | "system";
  targetId?: Types.ObjectId;
  details: Record<string, unknown>;
  ipHash?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    targetType: {
      type: String,
      enum: ["session", "room", "report", "admin", "system"],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipHash: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ performedBy: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", auditLogSchema);
