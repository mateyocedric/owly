import type { ServerWebSocket, WebSocketHandler } from "bun";
import { connectionManager, type WSContextData } from "./connection-manager.js";
import { handleClientEvent, endCurrentRoom } from "./events.js";
import { validateSessionToken } from "../services/session.js";
import {
  getUserState,
  setUserState,
} from "../matchmaking/state-machine.js";
import { removeFromQueue } from "../matchmaking/queue.js";
import { logEvent } from "../lib/logger.js";

export const websocketHandler: WebSocketHandler<WSContextData> = {
  async open(ws: ServerWebSocket<WSContextData>) {
    connectionManager.register(ws.data.sessionId, ws);
    await setUserState(ws.data.sessionId, "idle");

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
    connectionManager.unregister(sessionId);

    // Remove from matchmaking queues
    await removeFromQueue(sessionId, interests);

    // If currently chatting in a room, inform partner and close room
    if (roomId) {
      await endCurrentRoom(roomId, sessionId, "disconnect");
    }

    await setUserState(sessionId, "disconnected");

    logEvent({
      eventType: "ws_disconnected",
      sessionId,
      roomId,
      details: { code, reason },
    });
  },
};
