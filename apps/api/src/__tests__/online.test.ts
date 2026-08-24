import { describe, it, expect, vi, beforeEach } from "vitest";
import { ONLINE_PRESENCE, REDIS_KEYS } from "@owly/shared";

const redisMock = {
  zadd: vi.fn(),
  zrem: vi.fn(),
  zremrangebyscore: vi.fn(),
  zcard: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
};

vi.mock("../lib/redis.js", () => ({
  redis: redisMock,
}));

async function loadOnlineService() {
  vi.resetModules();
  return import("../services/online.js");
}

describe("online presence service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    redisMock.zcard.mockResolvedValue(0);
    redisMock.get.mockResolvedValue(null);
    redisMock.set.mockResolvedValue("OK");
  });

  it("marks a session online in the shared ZSET", async () => {
    const { markOnline } = await loadOnlineService();

    await markOnline("session-1");

    expect(redisMock.zadd).toHaveBeenCalledWith(
      REDIS_KEYS.ONLINE_SESSIONS,
      expect.any(Number),
      "session-1"
    );
  });

  it("counts unique sessions after duplicate markOnline calls", async () => {
    const { markOnline, getOnlineCount } = await loadOnlineService();

    await markOnline("session-1");
    await markOnline("session-1");
    redisMock.set.mockResolvedValueOnce("OK");
    redisMock.zcard.mockResolvedValueOnce(1);

    const count = await getOnlineCount();

    expect(count).toBe(1);
    expect(redisMock.zremrangebyscore).toHaveBeenCalled();
    expect(redisMock.set).toHaveBeenCalledWith(
      REDIS_KEYS.ONLINE_COUNT_CACHE,
      "1",
      "EX",
      ONLINE_PRESENCE.COUNT_CACHE_SECONDS
    );
  });

  it("removes a session on markOffline", async () => {
    const { markOffline } = await loadOnlineService();

    await markOffline("session-1");

    expect(redisMock.zrem).toHaveBeenCalledWith(
      REDIS_KEYS.ONLINE_SESSIONS,
      "session-1"
    );
  });

  it("returns cached count without recomputing the ZSET", async () => {
    const { getOnlineCount } = await loadOnlineService();
    redisMock.get.mockResolvedValueOnce("42");

    const count = await getOnlineCount();

    expect(count).toBe(42);
    expect(redisMock.zremrangebyscore).not.toHaveBeenCalled();
    expect(redisMock.zcard).not.toHaveBeenCalled();
  });

  it("waits for another instance to populate the cache when lock is held", async () => {
    const { getOnlineCount } = await loadOnlineService();
    redisMock.get
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce("7");
    redisMock.set.mockResolvedValueOnce(null);

    const count = await getOnlineCount();

    expect(count).toBe(7);
    expect(redisMock.zcard).not.toHaveBeenCalled();
  });
});
