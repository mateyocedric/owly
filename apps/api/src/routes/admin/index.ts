import { Hono } from "hono";
import { adminAuthRouter } from "./auth.js";
import { adminReportsRouter } from "./reports.js";
import { adminUsersRouter } from "./users.js";
import { adminMetricsRouter } from "./metrics.js";
import { adminConfigRouter } from "./config.js";
import { adminAuthMiddleware } from "../../middleware/admin-auth.js";

export const adminRouter = new Hono();

// Public auth endpoint
adminRouter.route("/auth", adminAuthRouter);

// Protected routes
adminRouter.use("/*", adminAuthMiddleware);
adminRouter.route("/reports", adminReportsRouter);
adminRouter.route("/users", adminUsersRouter);
adminRouter.route("/metrics", adminMetricsRouter);
adminRouter.route("/config", adminConfigRouter);
