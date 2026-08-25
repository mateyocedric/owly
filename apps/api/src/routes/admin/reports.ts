import { Hono } from "hono";
import { ModerationReport } from "@owly/database";
import {
  adminReportsListQuerySchema,
  updateReportStatusSchema,
} from "@owly/shared";
import { createAuditLog } from "../../services/audit.js";
import mongoose from "mongoose";

export const adminReportsRouter = new Hono();

// List reports with filters + pagination
adminReportsRouter.get("/", async (c) => {
  const parsed = adminReportsListQuerySchema.safeParse({
    page: c.req.query("page"),
    limit: c.req.query("limit"),
    status: c.req.query("status"),
  });
  if (!parsed.success) {
    return c.json({ error: "Invalid list query" }, 400);
  }

  const { page, limit, status } = parsed.data;
  const query = status === "all" ? {} : { status };
  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    ModerationReport.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ModerationReport.countDocuments(query),
  ]);

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
    total,
    page,
    limit,
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
