import { Hono } from "hono";
import { submitReportRequestSchema } from "@owly/shared";
import { submitModerationReport } from "../services/moderation.js";
import { createRateLimiter } from "../middleware/rate-limit.js";
import { env } from "../env.js";

export const reportRouter = new Hono();

reportRouter.post(
  "/report",
  createRateLimiter({
    keyPrefix: "report_submit",
    limit: env.RATE_LIMIT_REPORTS_PER_HOUR,
    windowSeconds: 3600,
  }),
  async (c) => {
    const session = c.get("session");
    if (!session) {
      return c.json({ error: "Unauthorized session" }, 401);
    }

    const body = await c.req.json();
    const parsed = submitReportRequestSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Invalid report data", details: parsed.error.format() }, 400);
    }

    try {
      const report = await submitModerationReport({
        reporterSessionId: session._id.toString(),
        roomId: parsed.data.roomId,
        category: parsed.data.category,
        description: parsed.data.description,
      });

      return c.json({
        success: true,
        reportId: report._id.toString(),
        status: report.status,
      });
    } catch (err: any) {
      return c.json({ error: err.message || "Failed to submit report" }, 400);
    }
  }
);
