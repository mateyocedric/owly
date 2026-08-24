import { Hono } from "hono";
import { createRateLimiter } from "../middleware/rate-limit.js";
import {
  getOnlineCount,
  onlineCountCacheMaxAgeSeconds,
} from "../services/online.js";

export const statsRouter = new Hono();

statsRouter.get(
  "/stats/online",
  createRateLimiter({
    keyPrefix: "stats_online",
    limit: 120,
    windowSeconds: 60,
  }),
  async (c) => {
    const online = await getOnlineCount();
    c.header(
      "Cache-Control",
      `public, max-age=${onlineCountCacheMaxAgeSeconds}, stale-while-revalidate=5`
    );
    return c.json({ online });
  }
);
