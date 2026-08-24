import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ServerWebSocket } from "bun";
import { MATCHMAKING, RATE_LIMITS } from "@owly/shared";
import type { WSContextData } from "../ws/connection-manager.js";

vi.mock("../lib/logger.js", () => ({
  logEvent: vi.fn(),
}));

vi.mock("../services/online.js", () => ({
  markOffline: vi.fn(async () => {}),
}));

async function load() {
  vi.resetModules();
  const managerMod = await import("../ws/connection-manager.js");
  const liveMod = await import("../matchmaking/live-session.js");
  return {
    connectionManager: managerMod.connectionManager,
    ...liveMod,
  };
}

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

describe("live session ghost guards", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("counts consecutive rooms without messages and resets after a sent message", async () => {
    const { connectionManager, recordFinishedRoom, hasEmptyMatchLimit } =
      await load();
    const ws = mockSocket("ghost");
    connectionManager.register("ghost", ws);

    for (let i = 0; i < MATCHMAKING.EMPTY_MATCH_STREAK_LIMIT - 1; i += 1) {
      expect(recordFinishedRoom("ghost", false)).toBe(i + 1);
      expect(hasEmptyMatchLimit("ghost")).toBe(false);
    }

    expect(recordFinishedRoom("ghost", false)).toBe(
      MATCHMAKING.EMPTY_MATCH_STREAK_LIMIT
    );
    expect(hasEmptyMatchLimit("ghost")).toBe(true);

    expect(recordFinishedRoom("ghost", true)).toBe(0);
    expect(hasEmptyMatchLimit("ghost")).toBe(false);
  });

  it("blocks requeue until the skip cooldown after a room ends", async () => {
    const { connectionManager, recordFinishedRoom, hasRequeueCooldown } =
      await load();
    const ws = mockSocket("ghost");
    connectionManager.register("ghost", ws);

    const endedAt = 1_000;
    recordFinishedRoom("ghost", false, endedAt);

    expect(
      hasRequeueCooldown(
        "ghost",
        endedAt + RATE_LIMITS.SKIP_COOLDOWN_SECONDS * 1000 - 1
      )
    ).toBe(true);
    expect(
      hasRequeueCooldown(
        "ghost",
        endedAt + RATE_LIMITS.SKIP_COOLDOWN_SECONDS * 1000
      )
    ).toBe(false);
  });

  it("does not treat a closed socket as a live match candidate", async () => {
    const { connectionManager, isLiveConnection } = await load();
    const ws = mockSocket("ghost", 3);
    connectionManager.register("ghost", ws);

    expect(isLiveConnection("ghost")).toBe(false);
    expect(isLiveConnection("missing")).toBe(false);
  });
});
