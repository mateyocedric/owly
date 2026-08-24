import { REDIS_KEYS } from "@owly/shared";
import { redis } from "../lib/redis.js";
import { logEvent } from "../lib/logger.js";
import { dropQueuedSession } from "./matcher.js";
import { hasLiveSocket, matchingOnlineCutoff } from "./liveness.js";
import { connectionManager } from "../ws/connection-manager.js";

const PRUNE_INTERVAL_MS = 30_000;

let pruneTimer: ReturnType<typeof setInterval> | null = null;
let pruning = false;

async function collectQueuedSessionIds(): Promise<string[]> {
  const queued = new Set<string>();
  const general = await redis.zrange(REDIS_KEYS.QUEUE_GENERAL, 0, -1);
  for (const id of general) queued.add(id);

  let cursor = "0";
  do {
    const [next, keys] = await redis.scan(
      cursor,
      "MATCH",
      `${REDIS_KEYS.QUEUE_INTEREST}*`,
      "COUNT",
      100
    );
    cursor = next;
    for (const key of keys) {
      const members = await redis.zrange(key, 0, -1);
      for (const id of members) queued.add(id);
    }
  } while (cursor !== "0");

  return [...queued];
}

/** Drop queue members that are neither freshly online nor holding a live socket. */
export async function pruneStaleQueuedSessions(): Promise<number> {
  const queued = await collectQueuedSessionIds();
  if (queued.length === 0) return 0;

  const liveOnline = await redis.zrangebyscore(
    REDIS_KEYS.ONLINE_SESSIONS,
    matchingOnlineCutoff(),
    "+inf"
  );

  if (liveOnline.length === 0 && connectionManager.count > 0) {
    return 0;
  }

  const online = new Set(liveOnline);
  let pruned = 0;

  for (const sessionId of queued) {
    if (online.has(sessionId) || hasLiveSocket(sessionId)) continue;
    await dropQueuedSession(sessionId);
    pruned += 1;
  }

  if (pruned > 0) {
    logEvent({
      eventType: "queue_pruned_stale",
      details: { pruned },
    });
  }

  return pruned;
}

export function startQueuePruner() {
  if (pruneTimer) return;
  pruneTimer = setInterval(() => {
    if (pruning) return;
    pruning = true;
    void pruneStaleQueuedSessions()
      .catch((err) => {
        console.error("Failed to prune stale matchmaking queue:", err);
      })
      .finally(() => {
        pruning = false;
      });
  }, PRUNE_INTERVAL_MS);
  pruneTimer.unref?.();
}
