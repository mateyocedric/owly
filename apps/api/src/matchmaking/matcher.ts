import { redis } from "../lib/redis.js";
import { REDIS_KEYS } from "@owly/shared";
import { ATOMIC_MATCH_SCRIPT } from "../lib/lua-scripts.js";
import { isBlocked } from "../services/block.js";

export async function tryAtomicMatch(): Promise<[string, string] | null> {
  // Execute Lua script to atomically pop two users from general queue
  const result = (await redis.eval(
    ATOMIC_MATCH_SCRIPT,
    1,
    REDIS_KEYS.QUEUE_GENERAL
  )) as [string, string] | null;

  if (!result || result.length < 2) {
    return null;
  }

  const [user1, user2] = result;

  // Check if users blocked each other
  const blocked = await isBlocked(user1, user2);
  if (blocked) {
    // Put them back in queue
    const now = Date.now();
    await redis.zadd(REDIS_KEYS.QUEUE_GENERAL, now, user1, now + 1, user2);
    return null;
  }

  return [user1, user2];
}
