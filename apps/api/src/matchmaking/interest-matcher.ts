import { redis } from "../lib/redis.js";
import { REDIS_KEYS } from "@owly/shared";
import { ATOMIC_INTEREST_MATCH_SCRIPT } from "../lib/lua-scripts.js";
import { isBlocked } from "../services/block.js";
import { restoreLiveOrDrop } from "./matcher.js";
import { matchingOnlineCutoff } from "./liveness.js";
import { normalizeInterest } from "./policy.js";

export async function tryInterestMatch(
  currentSessionId: string,
  interests: string[]
): Promise<{ pair: [string, string]; commonInterests: string[] } | null> {
  const skipped = new Set<string>();

  for (const interest of interests) {
    const slug = normalizeInterest(interest);
    if (!slug) continue;

    const interestKey = `${REDIS_KEYS.QUEUE_INTEREST}${slug}`;
    const result = (await redis.eval(
      ATOMIC_INTEREST_MATCH_SCRIPT,
      3,
      interestKey,
      REDIS_KEYS.QUEUE_GENERAL,
      REDIS_KEYS.ONLINE_SESSIONS,
      currentSessionId,
      REDIS_KEYS.QUEUE_INTEREST,
      REDIS_KEYS.QUEUE_SESSION_INTERESTS,
      String(matchingOnlineCutoff()),
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
        restoreLiveOrDrop(currentSessionId),
        restoreLiveOrDrop(partner),
      ]);
      continue;
    }

    return {
      pair: [currentSessionId, partner],
      commonInterests: [interest],
    };
  }

  return null;
}
