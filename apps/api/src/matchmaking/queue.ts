import { redis } from "../lib/redis.js";
import {
  SESSION,
  queueKeys,
  type ChatMode,
} from "@owly/shared";
import { normalizeInterest, shouldJoinGeneralQueue } from "./policy.js";

export { normalizeInterest, shouldJoinGeneralQueue } from "./policy.js";

function resolveMode(mode?: ChatMode): ChatMode {
  return mode === "text" ? "text" : "video";
}

function sessionInterestsKey(sessionId: string, mode: ChatMode): string {
  return `${queueKeys(mode).sessionInterests}${sessionId}`;
}

export async function addToQueue(
  sessionId: string,
  interests: string[] = [],
  options: { general?: boolean; mode?: ChatMode } = {}
): Promise<void> {
  const mode = resolveMode(options.mode);
  const keys = queueKeys(mode);
  const timestamp = Date.now();
  const includeGeneral = options.general !== false;
  const multi = redis.multi();

  if (includeGeneral) {
    multi.zadd(keys.general, timestamp, sessionId);
  }

  const slugs: string[] = [];
  for (const interest of interests) {
    const slug = normalizeInterest(interest);
    if (!slug) continue;
    slugs.push(slug);
    multi.zadd(`${keys.interest}${slug}`, timestamp, sessionId);
  }

  if (slugs.length > 0) {
    const trackedKey = sessionInterestsKey(sessionId, mode);
    multi.sadd(trackedKey, ...slugs);
    multi.expire(trackedKey, SESSION.TTL_SECONDS);
  }

  await multi.exec();
}

export async function addToGeneralQueue(
  sessionId: string,
  mode: ChatMode = "video"
): Promise<void> {
  const keys = queueKeys(resolveMode(mode));
  await redis.zadd(keys.general, Date.now(), sessionId);
}

export async function requeueSession(
  sessionId: string,
  interests: string[],
  queuedAt: number | undefined,
  interestTimeoutSeconds: number,
  mode: ChatMode = "video"
): Promise<void> {
  await addToQueue(sessionId, interests, {
    general: shouldJoinGeneralQueue(
      interests,
      queuedAt,
      interestTimeoutSeconds
    ),
    mode: resolveMode(mode),
  });
}

export async function removeFromQueue(
  sessionId: string,
  interests: string[] = [],
  mode: ChatMode = "video"
): Promise<void> {
  const resolved = resolveMode(mode);
  const keys = queueKeys(resolved);
  const trackedKey = sessionInterestsKey(sessionId, resolved);
  const tracked = await redis.smembers(trackedKey);
  const slugs = new Set<string>(tracked);

  for (const interest of interests) {
    const slug = normalizeInterest(interest);
    if (slug) slugs.add(slug);
  }

  const multi = redis.multi();
  multi.zrem(keys.general, sessionId);

  for (const slug of slugs) {
    multi.zrem(`${keys.interest}${slug}`, sessionId);
  }

  multi.del(trackedKey);
  await multi.exec();
}

export async function getQueuePosition(
  sessionId: string,
  mode: ChatMode = "video"
): Promise<number> {
  const keys = queueKeys(resolveMode(mode));
  const rank = await redis.zrank(keys.general, sessionId);
  return rank !== null ? rank + 1 : 0;
}
