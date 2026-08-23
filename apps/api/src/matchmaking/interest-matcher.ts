import { redis } from "../lib/redis.js";
import { REDIS_KEYS } from "@owly/shared";
import { ATOMIC_INTEREST_MATCH_SCRIPT } from "../lib/lua-scripts.js";
import { isBlocked } from "../services/block.js";

export async function tryInterestMatch(
  currentSessionId: string,
  interests: string[]
): Promise<{ pair: [string, string]; commonInterests: string[] } | null> {
  for (const interest of interests) {
    const slug = interest.toLowerCase().trim();
    if (!slug) continue;

    const interestKey = `${REDIS_KEYS.QUEUE_INTEREST}${slug}`;
    const result = (await redis.eval(
      ATOMIC_INTEREST_MATCH_SCRIPT,
      2,
      interestKey,
      REDIS_KEYS.QUEUE_GENERAL,
      currentSessionId
    )) as [string, string] | null;

    if (result && result.length === 2) {
      const [u1, u2] = result;
      const partner = u1 === currentSessionId ? u2 : u1;

      const blocked = await isBlocked(currentSessionId, partner);
      if (!blocked) {
        return {
          pair: [currentSessionId, partner],
          commonInterests: [interest],
        };
      }
    }
  }

  return null;
}
