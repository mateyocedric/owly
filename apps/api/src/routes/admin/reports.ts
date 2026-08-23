import { Hono } from "hono";
import { ModerationReport } from "@owly/database";
import { updateReportStatusSchema } from "@owly/shared";
import { createAuditLog } from "../../services/audit.js";
import mongoose from "mongoose";

export const adminReportsRouter = new Hono();

// List reports with filters
adminReportsRouter.get("/", async (c) => {
  const status = c.req.query("status") || "pending";
  const limit = Math.min(parseInt(c.req.query("limit") || "50"), 100);

  const query = status === "all" ? {} : { status };
  const reports = await ModerationReport.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);

  return c.json({
    reports: reports.map((r) => ({
      id: r._id.toString(),
      reporterSessionId: r.reporterSessionId.toString(),
      reportedSessionId: r.reportedSessionId.toString(),
      roomId: r.roomId.toString(),
      category: r.category,
      description: r.description,
      messageContext: r.messageContext,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      resolvedAt: r.resolvedAt?.toISOString(),
    })),
  });
});

// Update report status
adminReportsRouter.patch("/:id", async (c) => {
  const admin = c.get("adminUser");
  const reportId = c.req.param("id");

  const body = await c.req.json();
  const parsed = updateReportStatusSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid status update" }, 400);
  }

  const report = await ModerationReport.findById(reportId);
  if (!report) {
    return c.json({ error: "Report not found" }, 404);
  }

  report.status = parsed.data.status;
  if (parsed.data.status === "resolved" || parsed.data.status === "dismissed") {
    report.resolvedAt = new Date();
    report.resolvedBy = new mongoose.Types.ObjectId(admin!.userId);
  }
  await report.save();

  await createAuditLog({
    action: `report_${parsed.data.status}`,
    performedBy: admin!.userId,
    targetType: "report",
    targetId: reportId,
    details: { reason: parsed.data.reason },
  });

  return c.json({ success: true, report });
});
