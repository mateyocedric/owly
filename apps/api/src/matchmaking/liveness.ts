import { ONLINE_PRESENCE } from "@owly/shared";
import { connectionManager } from "../ws/connection-manager.js";

export function matchingOnlineCutoff(now = Date.now()): number {
  return now - ONLINE_PRESENCE.STALE_MS;
}

/** True when this process still has an open WebSocket for the session. */
export function hasLiveSocket(sessionId: string): boolean {
  const ws = connectionManager.get(sessionId);
  return !!ws && ws.readyState === 1;
}
