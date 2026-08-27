import { redis } from "../lib/redis.js";
import { queueKeys, type ChatMode } from "@owly/shared";
import { ATOMIC_MATCH_SCRIPT } from "../lib/lua-scripts.js";
import { isBlocked } from "../services/block.js";
import { requeueSession } from "./queue.js";
import { getUserState } from "./state-machine.js";
import { connectionManager } from "../ws/connection-manager.js";
import { env } from "../env.js";
import {
  isLiveConnection,
  markUnreachableOffline,
} from "./live-session.js";

function resolveMode(mode?: ChatMode): ChatMode {
  return mode === "text" ? "text" : "video";
}

function modeForSession(sessionId: string, fallback?: ChatMode): ChatMode {
  return resolveMode(
    connectionManager.get(sessionId)?.data.mode ?? fallback
  );
}

export async function tryAtomicMatch(
  currentSessionId: string,
  mode: ChatMode = "video"
): Promise<[string, string] | null> {
  const resolved = resolveMode(mode);
  const keys = queueKeys(resolved);
  const skipped = new Set<string>();

  for (let attempt = 0; attempt < 5; attempt++) {
    const result = (await redis.eval(
      ATOMIC_MATCH_SCRIPT,
      1,
      keys.general,
      currentSessionId,
      keys.interest,
      keys.sessionInterests,
      ...[...skipped]
    )) as [string, string] | null;

    if (!result || result.length < 2) {
      return null;
    }

    const [user1, user2] = result;
    const partner = user1 === currentSessionId ? user2 : user1;
    const blocked = await isBlocked(user1, user2);
    if (blocked) {
      skipped.add(partner);
      await restoreBoth(user1, user2);
      continue;
    }

    if (!isLiveConnection(partner)) {
      skipped.add(partner);
      await Promise.all([
        restoreQueuedSession(currentSessionId),
        markUnreachableOffline(partner),
      ]);
      continue;
    }

    if (!isLiveConnection(currentSessionId)) {
      await Promise.all([
        restoreQueuedSession(partner),
        markUnreachableOffline(currentSessionId),
      ]);
      return null;
    }

    return [user1, user2];
  }

  return null;
}

export async function restoreQueuedSession(sessionId: string) {
  const ws = connectionManager.get(sessionId);
  const interests = ws?.data.interests ?? [];
  const mode = modeForSession(sessionId);
  const presence = await getUserState(sessionId);
  await requeueSession(
    sessionId,
    interests,
    presence.queuedAt,
    env.MATCHMAKING_INTEREST_TIMEOUT_SECONDS,
    mode
  );
}

async function restoreBoth(user1: string, user2: string) {
  await Promise.all([restoreQueuedSession(user1), restoreQueuedSession(user2)]);
}
