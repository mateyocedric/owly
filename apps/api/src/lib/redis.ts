import Redis from "ioredis";
import { env } from "../env.js";

let redisInstance: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisInstance) {
    redisInstance = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 100, 3000);
        return delay;
      },
    });

    redisInstance.on("error", (err) => {
      console.error("Redis connection error:", err);
    });

    redisInstance.on("connect", () => {
      console.log("⚡ Redis connected");
    });
  }

  return redisInstance;
}

export const redis = getRedisClient();
