import { describe, it, expect, vi } from "vitest";
import { checkContentModeration } from "../services/moderation.js";

// Mock redis
vi.mock("../lib/redis.js", () => ({
  redis: {
    smembers: vi.fn().mockResolvedValue(["custombannedword", "maliciousbot"]),
  },
}));

describe("Content Moderation Service", () => {
  it("passes safe conversation messages", async () => {
    const result = await checkContentModeration("Hey! How is your day going?");
    expect(result.flagged).toBe(false);
  });

  it("flags messages with custom banned words from Redis", async () => {
    const result = await checkContentModeration(
      "You should check out custombannedword right now"
    );
    expect(result.flagged).toBe(true);
  });

  it("flags messages triggering severe harassment or threat patterns", async () => {
    const result = await checkContentModeration("go kill yourself right now");
    expect(result.flagged).toBe(true);
  });
});
