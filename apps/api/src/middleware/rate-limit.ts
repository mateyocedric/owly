import type { MiddlewareHandler } from "hono";
import { redis } from "../lib/redis.js";
import { hashIP } from "../lib/token.js";
import { REDIS_KEYS } from "@owly/shared";

export function createRateLimiter(options: {
  keyPrefix: string;
  limit: number;
  windowSeconds: number;
}): MiddlewareHandler {
  return async (c, next) => {
    const ip =
      c.req.header("cf-connecting-ip") ||
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
      "127.0.0.1";
    const ipHash = hashIP(ip);
    const redisKey = `${REDIS_KEYS.RATE_LIMIT}${options.keyPrefix}:${ipHash}`;

    const current = await redis.incr(redisKey);
    if (current === 1) {
      await redis.expire(redisKey, options.windowSeconds);
    }

    if (current > options.limit) {
      return c.json(
        {
          error: "Rate limit exceeded. Please slow down.",
          retryAfter: options.windowSeconds,
        },
        429
      );
    }

    c.header("x-ratelimit-limit", String(options.limit));
    c.header("x-ratelimit-remaining", String(Math.max(0, options.limit - current)));

    await next();
  };
}
