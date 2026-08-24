import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ServerWebSocket } from "bun";
import { ONLINE_PRESENCE, REDIS_KEYS } from "@owly/shared";
import type { WSContextData } from "../ws/connection-manager.js";
import { ATOMIC_MATCH_SCRIPT, ATOMIC_INTEREST_MATCH_SCRIPT } from "../lib/lua-scripts.js";

const redisMock = {
  eval: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  zrange: vi.fn(),
  zrangebyscore: vi.fn(),
  scan: vi.fn(),
  zadd: vi.fn(),
  zrem: vi.fn(),
  smembers: vi.fn(),
  sadd: vi.fn(),
  expire: vi.fn(),
  multi: vi.fn(),
};

vi.mock("../lib/redis.js", () => ({
  redis: redisMock,
}));

vi.mock("../services/block.js", () => ({
  isBlocked: vi.fn().mockResolvedValue(false),
}));

function mockSocket(
  sessionId: string,
  readyState = 1
): ServerWebSocket<WSContextData> {
  return {
    data: { sessionId, ip: "127.0.0.1" },
    readyState,
    close: vi.fn(),
    send: vi.fn(),
  } as unknown as ServerWebSocket<WSContextData>;
}

describe("ghost match prevention", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    redisMock.eval.mockResolvedValue(null);
    redisMock.get.mockResolvedValue(null);
    redisMock.set.mockResolvedValue("OK");
    redisMock.zrange.mockResolvedValue([]);
    redisMock.zrangebyscore.mockResolvedValue([]);
    redisMock.scan.mockResolvedValue(["0", []]);
    redisMock.smembers.mockResolvedValue([]);
    redisMock.multi.mockReturnValue({
      zadd: vi.fn().mockReturnThis(),
      zrem: vi.fn().mockReturnThis(),
      sadd: vi.fn().mockReturnThis(),
      expire: vi.fn().mockReturnThis(),
      del: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([]),
    });
  });

  it("keeps queued and matched presence across reconnects", async () => {
    const { presenceAfterReconnect } = await import(
      "../matchmaking/state-machine.js"
    );

    expect(
      presenceAfterReconnect({
        state: "queued",
        queuedAt: 1,
        lastSeenAt: 1,
      })
    ).toEqual({ state: "queued" });

    expect(
      presenceAfterReconnect({
        state: "matched",
        roomId: "room-1",
        lastSeenAt: 1,
      })
    ).toEqual({ state: "matched", roomId: "room-1" });

    expect(
      presenceAfterReconnect({ state: "idle", lastSeenAt: 1 })
    ).toEqual({ state: "idle", roomId: null });
  });

  it("treats only open sockets as live", async () => {
    vi.resetModules();
    const { connectionManager } = await import("../ws/connection-manager.js");
    const { hasLiveSocket } = await import("../matchmaking/liveness.js");

    connectionManager.register("live", mockSocket("live", 1));
    connectionManager.register("closed", mockSocket("closed", 3));

    expect(hasLiveSocket("live")).toBe(true);
    expect(hasLiveSocket("closed")).toBe(false);
    expect(hasLiveSocket("missing")).toBe(false);
  });

  it("passes the online set and cutoff into the general match script", async () => {
    const { tryAtomicMatch } = await import("../matchmaking/matcher.js");

    await tryAtomicMatch("user-1");

    expect(redisMock.eval).toHaveBeenCalledWith(
      ATOMIC_MATCH_SCRIPT,
      2,
      REDIS_KEYS.QUEUE_GENERAL,
      REDIS_KEYS.ONLINE_SESSIONS,
      "user-1",
      REDIS_KEYS.QUEUE_INTEREST,
      REDIS_KEYS.QUEUE_SESSION_INTERESTS,
      expect.stringMatching(/^\d+$/)
    );

    const cutoff = Number(redisMock.eval.mock.calls[0]?.[7]);
    expect(cutoff).toBeLessThanOrEqual(
      Date.now() - ONLINE_PRESENCE.STALE_MS + 50
    );
  });

  it("purges stale queue members that have no live socket", async () => {
    redisMock.zrange.mockResolvedValue(["ghost", "alive"]);
    redisMock.zrangebyscore.mockResolvedValue(["alive"]);
    redisMock.scan.mockResolvedValue(["0", []]);

    vi.resetModules();
    redisMock.zrange.mockResolvedValue(["ghost", "alive"]);
    redisMock.zrangebyscore.mockResolvedValue(["alive"]);
    redisMock.scan.mockResolvedValue(["0", []]);

    const { connectionManager } = await import("../ws/connection-manager.js");
    connectionManager.register("alive", mockSocket("alive"));

    const { pruneStaleQueuedSessions } = await import(
      "../matchmaking/prune.js"
    );
    const pruned = await pruneStaleQueuedSessions();

    expect(pruned).toBe(1);
  });

  it("does not prune when the online set looks evicted but sockets are live", async () => {
    redisMock.zrange.mockResolvedValue(["alive"]);
    redisMock.zrangebyscore.mockResolvedValue([]);
    redisMock.scan.mockResolvedValue(["0", []]);

    vi.resetModules();
    redisMock.zrange.mockResolvedValue(["alive"]);
    redisMock.zrangebyscore.mockResolvedValue([]);
    redisMock.scan.mockResolvedValue(["0", []]);

    const { connectionManager } = await import("../ws/connection-manager.js");
    connectionManager.register("alive", mockSocket("alive"));

    const { pruneStaleQueuedSessions } = await import(
      "../matchmaking/prune.js"
    );
    const pruned = await pruneStaleQueuedSessions();

    expect(pruned).toBe(0);
  });

  it("lua match scripts skip and clear members missing from the online set", () => {
    expect(ATOMIC_MATCH_SCRIPT).toContain("KEYS[2]");
    expect(ATOMIC_MATCH_SCRIPT).toContain("clearUser(member)");
    expect(ATOMIC_INTEREST_MATCH_SCRIPT).toContain("KEYS[3]");
    expect(ATOMIC_INTEREST_MATCH_SCRIPT).toContain("clearUser(member)");
  });
});
