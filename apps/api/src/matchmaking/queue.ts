import { redis } from "../lib/redis.js";
import { REDIS_KEYS, SESSION } from "@owly/shared";
import { normalizeInterest, shouldJoinGeneralQueue } from "./policy.js";

export { normalizeInterest, shouldJoinGeneralQueue } from "./policy.js";

function sessionInterestsKey(sessionId: string): string {
  return `${REDIS_KEYS.QUEUE_SESSION_INTERESTS}${sessionId}`;
}

export async function addToQueue(
  sessionId: string,
  interests: string[] = [],
  options: { general?: boolean } = {}
): Promise<void> {
  const timestamp = Date.now();
  const includeGeneral = options.general !== false;
  const multi = redis.multi();

  if (includeGeneral) {
    multi.zadd(REDIS_KEYS.QUEUE_GENERAL, timestamp, sessionId);
  }

  const slugs: string[] = [];
  for (const interest of interests) {
    const slug = normalizeInterest(interest);
    if (!slug) continue;
    slugs.push(slug);
    multi.zadd(`${REDIS_KEYS.QUEUE_INTEREST}${slug}`, timestamp, sessionId);
  }

  if (slugs.length > 0) {
    const trackedKey = sessionInterestsKey(sessionId);
    multi.sadd(trackedKey, ...slugs);
    multi.expire(trackedKey, SESSION.TTL_SECONDS);
  }

  await multi.exec();
}

export async function addToGeneralQueue(sessionId: string): Promise<void> {
  await redis.zadd(REDIS_KEYS.QUEUE_GENERAL, Date.now(), sessionId);
}

export async function requeueSession(
  sessionId: string,
  interests: string[],
  queuedAt: number | undefined,
  interestTimeoutSeconds: number
): Promise<void> {
  await addToQueue(sessionId, interests, {
    general: shouldJoinGeneralQueue(
      interests,
      queuedAt,
      interestTimeoutSeconds
    ),
  });
}

export async function removeFromQueue(
  sessionId: string,
  interests: string[] = []
): Promise<void> {
  const trackedKey = sessionInterestsKey(sessionId);
  const tracked = await redis.smembers(trackedKey);
  const slugs = new Set<string>(tracked);

  for (const interest of interests) {
    const slug = normalizeInterest(interest);
    if (slug) slugs.add(slug);
  }

  const multi = redis.multi();
  multi.zrem(REDIS_KEYS.QUEUE_GENERAL, sessionId);

  for (const slug of slugs) {
    multi.zrem(`${REDIS_KEYS.QUEUE_INTEREST}${slug}`, sessionId);
  }

  multi.del(trackedKey);
  await multi.exec();
}

export async function getQueuePosition(sessionId: string): Promise<number> {
  const rank = await redis.zrank(REDIS_KEYS.QUEUE_GENERAL, sessionId);
  return rank !== null ? rank + 1 : 0;
}
