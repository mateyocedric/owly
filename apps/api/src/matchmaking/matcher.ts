import { redis } from "../lib/redis.js";
import { REDIS_KEYS } from "@owly/shared";
import { ATOMIC_MATCH_SCRIPT } from "../lib/lua-scripts.js";
import { isBlocked } from "../services/block.js";
import { requeueSession } from "./queue.js";
import { getUserState } from "./state-machine.js";
import { connectionManager } from "../ws/connection-manager.js";
import { env } from "../env.js";

export async function tryAtomicMatch(
  currentSessionId: string
): Promise<[string, string] | null> {
  const skipped = new Set<string>();

  for (let attempt = 0; attempt < 5; attempt++) {
    const result = (await redis.eval(
      ATOMIC_MATCH_SCRIPT,
      1,
      REDIS_KEYS.QUEUE_GENERAL,
      currentSessionId,
      REDIS_KEYS.QUEUE_INTEREST,
      REDIS_KEYS.QUEUE_SESSION_INTERESTS,
      ...[...skipped]
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

async function restoreBoth(user1: string, user2: string) {
  await Promise.all([restoreQueuedSession(user1), restoreQueuedSession(user2)]);
}
