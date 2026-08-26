import { describe, it, expect, vi, beforeEach } from "vitest";
import { DEVICE_SESSION, REDIS_KEYS, isValidDeviceId } from "@owly/shared";
import {
  DEVICE_SESSION_ACQUIRE_SCRIPT,
  DEVICE_SESSION_REFRESH_SCRIPT,
  DEVICE_SESSION_RELEASE_SCRIPT,
} from "../lib/lua-scripts.js";

const redisMock = {
  eval: vi.fn(),
};

vi.mock("../lib/redis.js", () => ({
  redis: redisMock,
}));

const DEVICE_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";

async function loadService() {
  vi.resetModules();
  return import("../services/device-session.js");
}

describe("device session locks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    redisMock.eval.mockResolvedValue(1);
  });

  it("accepts a v4 UUID and rejects other strings", () => {
    expect(isValidDeviceId(DEVICE_ID)).toBe(true);
    expect(isValidDeviceId("not-a-uuid")).toBe(false);
    expect(isValidDeviceId("")).toBe(false);
  });

  it("acquires a device lock with SET NX semantics via Lua", async () => {
    const { acquireDeviceSession, deviceLockKey } = await loadService();

    const acquired = await acquireDeviceSession({
      sessionId: "session-1",
      deviceId: DEVICE_ID,
      ip: "1.2.3.4",
    });

    expect(acquired).toBe(true);
    expect(redisMock.eval).toHaveBeenCalledWith(
      DEVICE_SESSION_ACQUIRE_SCRIPT,
      1,
      deviceLockKey(DEVICE_ID),
      "session-1",
      String(DEVICE_SESSION.TTL_SECONDS)
    );
  });

  it("rejects when another session already owns the lock", async () => {
    const { acquireDeviceSession } = await loadService();
    redisMock.eval.mockResolvedValueOnce(0);

    const acquired = await acquireDeviceSession({
      sessionId: "session-2",
      deviceId: DEVICE_ID,
      ip: "1.2.3.4",
    });

    expect(acquired).toBe(false);
  });

  it("reuses the same acquire script for a reconnecting sessionId", async () => {
    const { acquireDeviceSession } = await loadService();

    await acquireDeviceSession({
      sessionId: "session-1",
      deviceId: DEVICE_ID,
      ip: "1.2.3.4",
    });
    await acquireDeviceSession({
      sessionId: "session-1",
      deviceId: DEVICE_ID,
      ip: "1.2.3.4",
    });

    expect(redisMock.eval).toHaveBeenCalledTimes(2);
    expect(redisMock.eval.mock.calls[1]?.[3]).toBe("session-1");
  });

  it("includes a hashed IP key when IP locking is enabled", async () => {
    const { acquireDeviceSession, deviceLockKey, ipLockKey } =
      await loadService();

    await acquireDeviceSession(
      {
        sessionId: "session-1",
        deviceId: DEVICE_ID,
        ip: "1.2.3.4",
      },
      { ipLockEnabled: true, ttlSeconds: 90 }
    );

    expect(redisMock.eval).toHaveBeenCalledWith(
      DEVICE_SESSION_ACQUIRE_SCRIPT,
      2,
      deviceLockKey(DEVICE_ID),
      ipLockKey("1.2.3.4"),
      "session-1",
      "90"
    );
  });

  it("skips Redis when there is no device id and IP lock is off", async () => {
    const { acquireDeviceSession } = await loadService();

    const acquired = await acquireDeviceSession({
      sessionId: "session-1",
      deviceId: "invalid",
      ip: "1.2.3.4",
    });

    expect(acquired).toBe(true);
    expect(redisMock.eval).not.toHaveBeenCalled();
  });

  it("refreshes TTL only through the owner-checked Lua script", async () => {
    const { refreshDeviceSession, deviceLockKey } = await loadService();

    await refreshDeviceSession({
      sessionId: "session-1",
      deviceId: DEVICE_ID,
      ip: "1.2.3.4",
    });

    expect(redisMock.eval).toHaveBeenCalledWith(
      DEVICE_SESSION_REFRESH_SCRIPT,
      1,
      deviceLockKey(DEVICE_ID),
      "session-1",
      String(DEVICE_SESSION.TTL_SECONDS)
    );
  });

  it("releases with compare-and-delete and is safe to call twice", async () => {
    const { releaseDeviceSession, deviceLockKey } = await loadService();
    redisMock.eval.mockResolvedValue(1);

    await releaseDeviceSession({
      sessionId: "session-1",
      deviceId: DEVICE_ID,
      ip: "1.2.3.4",
    });
    await releaseDeviceSession({
      sessionId: "session-1",
      deviceId: DEVICE_ID,
      ip: "1.2.3.4",
    });

    expect(redisMock.eval).toHaveBeenCalledTimes(2);
    expect(redisMock.eval).toHaveBeenCalledWith(
      DEVICE_SESSION_RELEASE_SCRIPT,
      1,
      deviceLockKey(DEVICE_ID),
      "session-1"
    );
    expect(deviceLockKey(DEVICE_ID).startsWith(REDIS_KEYS.ACTIVE_DEVICE)).toBe(
      true
    );
  });
});
