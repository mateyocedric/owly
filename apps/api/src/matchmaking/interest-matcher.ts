import { redis } from "../lib/redis.js";
import { queueKeys, type ChatMode } from "@owly/shared";
import { ATOMIC_INTEREST_MATCH_SCRIPT } from "../lib/lua-scripts.js";
import { isBlocked } from "../services/block.js";
import { restoreQueuedSession } from "./matcher.js";
import { normalizeInterest } from "./policy.js";
import {
  isLiveConnection,
  markUnreachableOffline,
} from "./live-session.js";

function resolveMode(mode?: ChatMode): ChatMode {
  return mode === "text" ? "text" : "video";
}

export async function tryInterestMatch(
  currentSessionId: string,
  interests: string[],
  mode: ChatMode = "video"
): Promise<{ pair: [string, string]; commonInterests: string[] } | null> {
  const resolved = resolveMode(mode);
  const keys = queueKeys(resolved);
  const skipped = new Set<string>();

  for (const interest of interests) {
    const slug = normalizeInterest(interest);
    if (!slug) continue;

    const interestKey = `${keys.interest}${slug}`;
    const result = (await redis.eval(
      ATOMIC_INTEREST_MATCH_SCRIPT,
      2,
      interestKey,
      keys.general,
      currentSessionId,
      keys.interest,
      keys.sessionInterests,
      ...[...skipped]
    )) as [string, string] | null;

    if (!result || result.length !== 2) {
      continue;
    }

    const [u1, u2] = result;
    const partner = u1 === currentSessionId ? u2 : u1;

    const blocked = await isBlocked(currentSessionId, partner);
    if (blocked) {
      skipped.add(partner);
      await Promise.all([
        restoreQueuedSession(currentSessionId),
        restoreQueuedSession(partner),
      ]);
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

    return {
      pair: [currentSessionId, partner],
      commonInterests: [interest],
    };
  }

  return null;
}
