import type { ServerWebSocket, WebSocketHandler } from "bun";
import { connectionManager, type WSContextData } from "./connection-manager.js";
import { handleClientEvent, endCurrentRoom, clearGeneralFallbackTimer } from "./events.js";
import { setUserState } from "../matchmaking/state-machine.js";
import { removeFromQueue } from "../matchmaking/queue.js";
import { markOnline, markOffline } from "../services/online.js";
import { logEvent } from "../lib/logger.js";

export const websocketHandler: WebSocketHandler<WSContextData> = {
  idleTimeout: 120,
  async open(ws: ServerWebSocket<WSContextData>) {
    connectionManager.register(ws.data.sessionId, ws);
    await markOnline(ws.data.sessionId);
    await setUserState(ws.data.sessionId, "idle", { roomId: null });

    logEvent({
      eventType: "ws_connected",
      sessionId: ws.data.sessionId,
      details: { ip: ws.data.ip },
    });
  },

  async message(ws: ServerWebSocket<WSContextData>, message: string | Buffer) {
    const raw = typeof message === "string" ? message : message.toString("utf-8");
    await handleClientEvent(ws, raw);
  },

  async close(ws: ServerWebSocket<WSContextData>, code: number, reason: string) {
    const { sessionId, roomId, interests } = ws.data;
    const wentOffline = connectionManager.unregister(sessionId, ws);

    if (!wentOffline) {
      logEvent({
        eventType: "ws_disconnected",
        sessionId,
        roomId,
        details: { code, reason, replaced: true },
      });
      return;
    }

    await markOffline(sessionId);
    clearGeneralFallbackTimer(sessionId);

    // Remove from matchmaking queues
    await removeFromQueue(sessionId, interests);

    // If currently chatting in a room, inform partner and close room
    if (roomId) {
      await endCurrentRoom(roomId, sessionId, "disconnect");
    }

    await setUserState(sessionId, "disconnected", { roomId: null });

    logEvent({
      eventType: "ws_disconnected",
      sessionId,
      roomId,
      details: { code, reason },
    });
  },
};
