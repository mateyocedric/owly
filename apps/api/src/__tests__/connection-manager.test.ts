import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ServerWebSocket } from "bun";
import type { WSContextData } from "../ws/connection-manager.js";

// Fresh module per test so the singleton map is isolated.
async function loadConnectionManager() {
  vi.resetModules();
  const mod = await import("../ws/connection-manager.js");
  return mod.connectionManager;
}

function mockSocket(sessionId: string): ServerWebSocket<WSContextData> {
  return {
    data: { sessionId, ip: "127.0.0.1" },
    readyState: 1,
    close: vi.fn(),
    send: vi.fn(),
  } as unknown as ServerWebSocket<WSContextData>;
}

describe("ConnectionManager", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("replaces an existing socket for the same sessionId", async () => {
    const manager = await loadConnectionManager();
    const first = mockSocket("session-a");
    const second = mockSocket("session-a");

    manager.register("session-a", first);
    manager.register("session-a", second);

    expect(first.close).toHaveBeenCalledWith(4000, "Replaced by newer connection");
    expect(manager.get("session-a")).toBe(second);
    expect(manager.count).toBe(1);
  });

  it("does not unregister when an replaced socket closes", async () => {
    const manager = await loadConnectionManager();
    const first = mockSocket("session-a");
    const second = mockSocket("session-a");

    manager.register("session-a", first);
    manager.register("session-a", second);

    const wentOffline = manager.unregister("session-a", first);

    expect(wentOffline).toBe(false);
    expect(manager.has("session-a")).toBe(true);
    expect(manager.count).toBe(1);
  });

  it("unregisters only the active socket", async () => {
    const manager = await loadConnectionManager();
    const ws = mockSocket("session-a");

    manager.register("session-a", ws);

    const wentOffline = manager.unregister("session-a", ws);

    expect(wentOffline).toBe(true);
    expect(manager.has("session-a")).toBe(false);
    expect(manager.count).toBe(0);
  });
});
