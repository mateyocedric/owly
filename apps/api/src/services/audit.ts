import { AuditLog } from "@owly/database";
import mongoose from "mongoose";

export async function createAuditLog(params: {
  action: string;
  performedBy: string;
  targetType: "session" | "room" | "report" | "admin" | "system";
  targetId?: string;
  details?: Record<string, unknown>;
  ipHash?: string;
}) {
  await AuditLog.create({
    action: params.action,
    performedBy: new mongoose.Types.ObjectId(params.performedBy),
    targetType: params.targetType,
    targetId: params.targetId
      ? new mongoose.Types.ObjectId(params.targetId)
      : undefined,
    details: params.details || {},
    ipHash: params.ipHash,
  });
}
