import { Hono } from "hono";
import { redis } from "../../lib/redis.js";
import { REDIS_KEYS } from "@owly/shared";
import { z } from "zod";

export const adminConfigRouter = new Hono();

adminConfigRouter.get("/banned-words", async (c) => {
  const words = await redis.smembers(REDIS_KEYS.BANNED_WORDS);
  return c.json({ words });
});

const bannedWordsSchema = z.object({
  words: z.array(z.string().min(1).max(100)),
});

adminConfigRouter.put("/banned-words", async (c) => {
  const body = await c.req.json();
  const parsed = bannedWordsSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid word list" }, 400);
  }

  // Replace banned words set in Redis
  await redis.del(REDIS_KEYS.BANNED_WORDS);
  if (parsed.data.words.length > 0) {
    await redis.sadd(REDIS_KEYS.BANNED_WORDS, ...parsed.data.words);
  }

  return c.json({ success: true, count: parsed.data.words.length });
});
