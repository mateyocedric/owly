import { Hono } from "hono";
import { redis } from "../lib/redis.js";
import { mongoose } from "@owly/database";

export const healthRouter = new Hono();

const startTime = Date.now();

healthRouter.get("/health", async (c) => {
  let dbStatus = "ok";
  let redisStatus = "ok";

  try {
    if (mongoose.connection.readyState !== 1) {
      dbStatus = "disconnected";
    }
  } catch {
    dbStatus = "error";
  }

  try {
    await redis.ping();
  } catch {
    redisStatus = "error";
  }

  const overallStatus =
    dbStatus === "ok" && redisStatus === "ok" ? "ok" : "degraded";

  return c.json(
    {
      status: overallStatus,
      version: "1.0.0",
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
    },
    overallStatus === "ok" ? 200 : 503
  );
});

healthRouter.get("/ready", (c) => {
  return c.json({ ready: true });
});
