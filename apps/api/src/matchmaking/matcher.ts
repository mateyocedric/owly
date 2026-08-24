import { redis } from "../lib/redis.js";
import { REDIS_KEYS } from "@owly/shared";
import { ATOMIC_MATCH_SCRIPT } from "../lib/lua-scripts.js";
import { isBlocked } from "../services/block.js";
import { requeueSession, removeFromQueue } from "./queue.js";
import { getUserState, setUserState } from "./state-machine.js";
import { connectionManager } from "../ws/connection-manager.js";
import { env } from "../env.js";
import { hasLiveSocket, matchingOnlineCutoff } from "./liveness.js";

function matchScriptTail(skipped: Set<string>): string[] {
  return [String(matchingOnlineCutoff()), ...skipped];
}

export async function tryAtomicMatch(
  currentSessionId: string
): Promise<[string, string] | null> {
  const skipped = new Set<string>();

  for (let attempt = 0; attempt < 5; attempt++) {
    const result = (await redis.eval(
      ATOMIC_MATCH_SCRIPT,
      2,
      REDIS_KEYS.QUEUE_GENERAL,
      REDIS_KEYS.ONLINE_SESSIONS,
      currentSessionId,
      REDIS_KEYS.QUEUE_INTEREST,
      REDIS_KEYS.QUEUE_SESSION_INTERESTS,
      ...matchScriptTail(skipped)
    )) as [string, string] | null;

    if (!result || result.length < 2) {
      return null;
    }

    const [user1, user2] = result;
    const blocked = await isBlocked(user1, user2);
    if (!blocked) {
      return [user1, user2];
    }

    const partner = user1 === currentSessionId ? user2 : user1;
    skipped.add(partner);
    await restoreBoth(user1, user2);
  }

  return null;
}

export async function restoreQueuedSession(sessionId: string) {
  const interests = connectionManager.get(sessionId)?.data.interests ?? [];
  const presence = await getUserState(sessionId);
  await requeueSession(
    sessionId,
    interests,
    presence.queuedAt,
    env.MATCHMAKING_INTEREST_TIMEOUT_SECONDS
  );
}

export async function dropQueuedSession(sessionId: string) {
  await removeFromQueue(sessionId);
  await setUserState(sessionId, "disconnected", { roomId: null });
}

/** Requeue a live waiter; purge anyone without an open socket. */
export async function restoreLiveOrDrop(sessionId: string) {
  if (hasLiveSocket(sessionId)) {
    await restoreQueuedSession(sessionId);
    return;
  }
  await dropQueuedSession(sessionId);
}

async function restoreBoth(user1: string, user2: string) {
  await Promise.all([restoreLiveOrDrop(user1), restoreLiveOrDrop(user2)]);
}
