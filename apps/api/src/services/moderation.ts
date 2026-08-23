import {
  ModerationReport,
  type ReportCategory,
  AnonymousSession,
  ModerationAction,
} from "@owly/database";
import { getRoomCache } from "./room.js";
import { redis } from "../lib/redis.js";
import { REDIS_KEYS } from "@owly/shared";
import mongoose from "mongoose";

// Default banned word patterns (can be configured via admin API)
const DEFAULT_BANNED_PATTERNS = [
  /(\b(?:child|cp|csam|minor)\b.*(?:sex|porn|nude))/i,
  /(\b(?:credit\s*card|cvv|ssn|social\s*security)\b)/i,
  /(\b(?:hitman|kill\s*yourself|kys|bomb\s*threat)\b)/i,
];

export async function checkContentModeration(
  text: string
): Promise<{ flagged: boolean; reason?: string }> {
  // Check against Redis custom banned patterns
  const customWords = await redis.smembers(REDIS_KEYS.BANNED_WORDS);
  const lower = text.toLowerCase();

  for (const word of customWords) {
    if (lower.includes(word.toLowerCase())) {
      return { flagged: true, reason: "Message contains restricted terms" };
    }
  }

  for (const pattern of DEFAULT_BANNED_PATTERNS) {
    if (pattern.test(text)) {
      return { flagged: true, reason: "Message triggered safety filter" };
    }
  }

  return { flagged: false };
}

export async function submitModerationReport(params: {
  reporterSessionId: string;
  roomId: string;
  category: ReportCategory;
  description?: string;
}) {
  const room = await getRoomCache(params.roomId);
  if (!room) {
    throw new Error("Chat room not found or session expired");
  }

  const partnerSessionId = room.participants.find(
    (p) => p !== params.reporterSessionId
  );

  if (!partnerSessionId) {
    throw new Error("No partner found for this room");
  }

  // Format message context from ephemeral cache
  const messageContext = room.recentMessages.map((msg) => ({
    sender:
      msg.senderSessionId === params.reporterSessionId
        ? ("self" as const)
        : ("partner" as const),
    content: msg.content,
    timestamp: new Date(msg.timestamp),
  }));

  const report = await ModerationReport.create({
    reporterSessionId: new mongoose.Types.ObjectId(params.reporterSessionId),
    reportedSessionId: new mongoose.Types.ObjectId(partnerSessionId),
    roomId: new mongoose.Types.ObjectId(params.roomId),
    category: params.category,
    description: params.description,
    messageContext,
    status: "pending",
  });

  return report;
}

export async function applyModerationAction(params: {
  targetSessionId: string;
  actionType: "warning" | "temporary_ban" | "permanent_ban" | "unban";
  reason: string;
  adminUserId: string;
  reportId?: string;
  durationHours?: number;
}) {
  const targetId = new mongoose.Types.ObjectId(params.targetSessionId);
  const adminId = new mongoose.Types.ObjectId(params.adminUserId);

  let expiresAt: Date | undefined;
  if (params.actionType === "temporary_ban" && params.durationHours) {
    expiresAt = new Date(Date.now() + params.durationHours * 3600 * 1000);
  }

  const action = await ModerationAction.create({
    targetSessionId: targetId,
    reportId: params.reportId ? new mongoose.Types.ObjectId(params.reportId) : undefined,
    actionType: params.actionType,
    reason: params.reason,
    performedBy: adminId,
    expiresAt,
  });

  // Update session status
  let status: "active" | "warned" | "temporarily_banned" | "permanently_banned" = "active";
  if (params.actionType === "warning") status = "warned";
  else if (params.actionType === "temporary_ban") status = "temporarily_banned";
  else if (params.actionType === "permanent_ban") status = "permanently_banned";
  else if (params.actionType === "unban") status = "active";

  await AnonymousSession.updateOne({ _id: targetId }, { status });

  // Update redis cache
  await redis.del(`${REDIS_KEYS.SESSION_STATE}${params.targetSessionId}`);

  return action;
}
