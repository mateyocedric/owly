import { join } from "node:path";
import { Hono } from "hono";
import { connectDB } from "@owly/database";
import { env } from "./env.js";
import { requestIdMiddleware } from "./middleware/request-id.js";
import { corsMiddleware } from "./middleware/cors.js";
import { sessionMiddleware } from "./middleware/session.js";
import { healthRouter } from "./routes/health.js";
import { sessionRouter } from "./routes/session.js";
import { reportRouter } from "./routes/report.js";
import { interestsRouter } from "./routes/interests.js";
import { statsRouter } from "./routes/stats.js";
import { adminRouter } from "./routes/admin/index.js";
import { websocketHandler } from "./ws/handler.js";
import { validateSessionToken } from "./services/session.js";
import { parseDeviceId } from "./services/device-session.js";
import { spaFallback } from "./static.js";
import { canonicalHostMiddleware } from "./middleware/canonical-host.js";
import type { WSContextData } from "./ws/connection-manager.js";

// Initialize Database connection
await connectDB();

const app = new Hono();

// Global Middlewares
app.use("*", requestIdMiddleware);
app.use("*", canonicalHostMiddleware);
app.use("*", corsMiddleware);
app.use("/api/*", sessionMiddleware);

// Mount HTTP Routes
app.route("/", healthRouter);
app.route("/api", sessionRouter);
app.route("/api", reportRouter);
app.route("/api", interestsRouter);
app.route("/api", statsRouter);
app.route("/api/admin", adminRouter);

if (env.NODE_ENV === "production") {
  const distDir =
    process.env["WEB_DIST_PATH"] || join(import.meta.dir, "../../web/dist");
  app.use("*", spaFallback(distDir));
}

// Start Bun Server with native WebSocket support
const server = Bun.serve<WSContextData>({
  port: env.API_PORT,
  hostname: env.API_HOST,
  fetch(req, server) {
    const url = new URL(req.url);

    // WebSocket upgrade endpoint
    if (url.pathname === "/ws") {
      const token =
        url.searchParams.get("token") ||
        req.headers.get("cookie")?.match(/owly_session=([^;]+)/)?.[1];

      if (!token) {
        return new Response("Unauthorized: Missing session token", {
          status: 401,
        });
      }

      // Upgrade asynchronously
      return (async () => {
        const session = await validateSessionToken(token);
        if (!session) {
          return new Response("Unauthorized: Invalid session token", {
            status: 401,
          });
        }

        const ip =
          req.headers.get("cf-connecting-ip") ||
          req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          "127.0.0.1";

        const upgraded = server.upgrade(req, {
          data: {
            sessionId: session._id.toString(),
            ip,
            deviceId: parseDeviceId(url.searchParams.get("deviceId")),
            userAgent: req.headers.get("user-agent") || undefined,
          },
        });

        if (!upgraded) {
          return new Response("WebSocket upgrade failed", { status: 400 });
        }

        return undefined;
      })();
    }

    // Standard HTTP route handler
    return app.fetch(req);
  },
  websocket: websocketHandler,
  development: env.NODE_ENV !== "production",
});

console.log(`🦉 Owly API & WebSocket server running at http://${server.hostname}:${server.port}`);
