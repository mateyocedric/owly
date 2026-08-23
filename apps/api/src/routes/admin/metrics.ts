import { Hono } from "hono";
import {
  AnonymousSession,
  ChatRoom,
  ModerationReport,
  BanRecord,
} from "@owly/database";

export const adminMetricsRouter = new Hono();

adminMetricsRouter.get("/", async (c) => {
  const [
    totalSessions,
    activeSessions,
    totalRooms,
    pendingReports,
    totalBans,
  ] = await Promise.all([
    AnonymousSession.countDocuments(),
    AnonymousSession.countDocuments({ status: "active", expiresAt: { $gt: new Date() } }),
    ChatRoom.countDocuments(),
    ModerationReport.countDocuments({ status: "pending" }),
    BanRecord.countDocuments(),
  ]);

  return c.json({
    metrics: {
      totalSessions,
      activeSessions,
      totalRooms,
      pendingReports,
      totalBans,
    },
    timestamp: new Date().toISOString(),
  });
});
