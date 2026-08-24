import { ONLINE_PRESENCE, REDIS_KEYS } from "@owly/shared";
import { redis } from "../lib/redis.js";

/** Drop sessions with no heartbeat within this window. */
export const ONLINE_STALE_MS = ONLINE_PRESENCE.STALE_MS;

const CACHE_TTL_SECONDS = ONLINE_PRESENCE.COUNT_CACHE_SECONDS;
const LOCK_TTL_SECONDS = ONLINE_PRESENCE.COUNT_LOCK_SECONDS;
const LOCK_WAIT_MS = 50;
const LOCK_RETRIES = 5;

export async function markOnline(sessionId: string): Promise<void> {
  await redis.zadd(REDIS_KEYS.ONLINE_SESSIONS, Date.now(), sessionId);
}

export async function touchOnline(sessionId: string): Promise<void> {
  await markOnline(sessionId);
}

export async function markOffline(sessionId: string): Promise<void> {
  await redis.zrem(REDIS_KEYS.ONLINE_SESSIONS, sessionId);
}

async function computeOnlineCount(): Promise<number> {
  const cutoff = Date.now() - ONLINE_STALE_MS;
  await redis.zremrangebyscore(REDIS_KEYS.ONLINE_SESSIONS, "-inf", cutoff);
  return redis.zcard(REDIS_KEYS.ONLINE_SESSIONS);
}

async function writeOnlineCountCache(count: number): Promise<void> {
  await redis.set(
    REDIS_KEYS.ONLINE_COUNT_CACHE,
    String(count),
    "EX",
    CACHE_TTL_SECONDS
  );
}

async function refreshOnlineCountCache(): Promise<number> {
  const count = await computeOnlineCount();
  await writeOnlineCountCache(count);
  return count;
}

async function waitForCachedCount(): Promise<number | null> {
  for (let attempt = 0; attempt < LOCK_RETRIES; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, LOCK_WAIT_MS));
    const cached = await redis.get(REDIS_KEYS.ONLINE_COUNT_CACHE);
    if (cached !== null) {
      return Number(cached);
    }
  }
  return null;
}

/** Returns a cached count shared across API instances; recomputes at most once per TTL window. */
export async function getOnlineCount(): Promise<number> {
  const cached = await redis.get(REDIS_KEYS.ONLINE_COUNT_CACHE);
  if (cached !== null) {
    return Number(cached);
  }

  const lockAcquired = await redis.set(
    REDIS_KEYS.ONLINE_COUNT_LOCK,
    "1",
    "EX",
    LOCK_TTL_SECONDS,
    "NX"
  );

  if (!lockAcquired) {
    const waited = await waitForCachedCount();
    if (waited !== null) {
      return waited;
    }
    return computeOnlineCount();
  }

  return refreshOnlineCountCache();
}

export const onlineCountCacheMaxAgeSeconds = CACHE_TTL_SECONDS;
