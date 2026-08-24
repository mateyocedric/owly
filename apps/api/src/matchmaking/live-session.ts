import { MATCHMAKING, RATE_LIMITS, WS_CLOSE } from "@owly/shared";
import { connectionManager } from "../ws/connection-manager.js";
import { markOffline } from "../services/online.js";
import { logEvent } from "../lib/logger.js";

export function isLiveConnection(sessionId: string): boolean {
  return connectionManager.isLive(sessionId);
}

export function sessionSentMessage(
  sessionId: string,
  room: { recentMessages: Array<{ senderSessionId: string }> }
): boolean {
  return room.recentMessages.some((message) => message.senderSessionId === sessionId);
}

/** Record a finished room on the live socket. Returns the new empty-match streak. */
export function recordFinishedRoom(
  sessionId: string,
  sentMessage: boolean,
  now = Date.now()
): number {
  const ws = connectionManager.get(sessionId);
  if (!ws) return 0;
  ws.data.lastRoomEndedAt = now;
  if (sentMessage) {
    ws.data.emptyMatchStreak = 0;
    return 0;
  }
  ws.data.emptyMatchStreak = (ws.data.emptyMatchStreak ?? 0) + 1;
  return ws.data.emptyMatchStreak;
}

export function hasEmptyMatchLimit(sessionId: string): boolean {
  const ws = connectionManager.get(sessionId);
  return (ws?.data.emptyMatchStreak ?? 0) >= MATCHMAKING.EMPTY_MATCH_STREAK_LIMIT;
}

export function hasRequeueCooldown(sessionId: string, now = Date.now()): boolean {
  const ws = connectionManager.get(sessionId);
  if (!ws?.data.lastRoomEndedAt) return false;
  return now - ws.data.lastRoomEndedAt < RATE_LIMITS.SKIP_COOLDOWN_SECONDS * 1000;
}

export async function markUnreachableOffline(sessionId: string): Promise<void> {
  await markOffline(sessionId);
}

export function evictEmptyMatchLooper(sessionId: string): void {
  const ws = connectionManager.get(sessionId);
  if (!ws || ws.readyState !== 1) return;

  logEvent({
    eventType: "empty_match_limit",
    sessionId,
    details: { streak: ws.data.emptyMatchStreak ?? 0 },
  });

  ws.send(
    JSON.stringify({
      type: "error",
      data: {
        code: "EMPTY_MATCH_LIMIT",
        message: "Too many chats without messages. Click Start Chatting to try again.",
      },
    })
  );
  ws.send(
    JSON.stringify({
      type: "chat.ended",
      data: { reason: "timeout" },
    })
  );
  ws.close(WS_CLOSE.EMPTY_MATCH_LIMIT, "Too many empty matches");
}
