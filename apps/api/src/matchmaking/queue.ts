import { redis } from "../lib/redis.js";
import { REDIS_KEYS } from "@owly/shared";

export async function addToQueue(
  sessionId: string,
  interests: string[] = []
): Promise<void> {
  const timestamp = Date.now();

  const multi = redis.multi();

  // Add to general queue
  multi.zadd(REDIS_KEYS.QUEUE_GENERAL, timestamp, sessionId);

  // Add to interest-specific queues
  for (const interest of interests) {
    const slug = interest.toLowerCase().trim();
    if (slug) {
      multi.zadd(`${REDIS_KEYS.QUEUE_INTEREST}${slug}`, timestamp, sessionId);
    }
  }

  await multi.exec();
}

export async function removeFromQueue(
  sessionId: string,
  interests: string[] = []
): Promise<void> {
  const multi = redis.multi();

  multi.zrem(REDIS_KEYS.QUEUE_GENERAL, sessionId);

  for (const interest of interests) {
    const slug = interest.toLowerCase().trim();
    if (slug) {
      multi.zrem(`${REDIS_KEYS.QUEUE_INTEREST}${slug}`, sessionId);
    }
  }

  await multi.exec();
}

export async function getQueuePosition(sessionId: string): Promise<number> {
  const rank = await redis.zrank(REDIS_KEYS.QUEUE_GENERAL, sessionId);
  return rank !== null ? rank + 1 : 0;
}
