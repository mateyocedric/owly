import { Hono } from "hono";
import { AnonymousSession, BanRecord } from "@owly/database";
import { moderateUserSchema } from "@owly/shared";
import { applyModerationAction } from "../../services/moderation.js";
import { createAuditLog } from "../../services/audit.js";
import mongoose from "mongoose";

export const adminUsersRouter = new Hono();

// List sessions with status filter
adminUsersRouter.get("/", async (c) => {
  const status = c.req.query("status");
  const query = status ? { status } : {};
  const sessions = await AnonymousSession.find(query)
    .sort({ createdAt: -1 })
    .limit(50);

  return c.json({
    sessions: sessions.map((s) => ({
      id: s._id.toString(),
      status: s.status,
      ipHash: s.ipHash,
      userAgent: s.userAgent,
      interests: s.interests,
      createdAt: s.createdAt.toISOString(),
      lastActiveAt: s.lastActiveAt.toISOString(),
      expiresAt: s.expiresAt.toISOString(),
    })),
  });
});

// Moderate / Ban user session
adminUsersRouter.post("/:id/moderate", async (c) => {
  const admin = c.get("adminUser");
  const sessionId = c.req.param("id");

  const body = await c.req.json();
  const parsed = moderateUserSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid moderation action", details: parsed.error.format() }, 400);
  }

  const session = await AnonymousSession.findById(sessionId);
  if (!session) {
    return c.json({ error: "Session not found" }, 404);
  }

  const action = await applyModerationAction({
    targetSessionId: sessionId,
    actionType: parsed.data.action,
    reason: parsed.data.reason,
    adminUserId: admin!.userId,
    durationHours: parsed.data.duration,
  });

  // If permanent or temporary ban, also record IP ban
  if (parsed.data.action === "permanent_ban" || parsed.data.action === "temporary_ban") {
    let expiresAt: Date | undefined;
    if (parsed.data.action === "temporary_ban" && parsed.data.duration) {
      expiresAt = new Date(Date.now() + parsed.data.duration * 3600 * 1000);
    }

    await BanRecord.create({
      ipHash: session.ipHash,
      sessionId: session._id,
      reason: parsed.data.reason,
      bannedBy: new mongoose.Types.ObjectId(admin!.userId),
      type: parsed.data.action === "permanent_ban" ? "permanent" : "temporary",
      expiresAt,
    });
  }

  await createAuditLog({
    action: `user_${parsed.data.action}`,
    performedBy: admin!.userId,
    targetType: "session",
    targetId: sessionId,
    details: { reason: parsed.data.reason, duration: parsed.data.duration },
  });

  return c.json({ success: true, action });
});
