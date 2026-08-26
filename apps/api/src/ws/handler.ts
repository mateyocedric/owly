import type { ServerWebSocket, WebSocketHandler } from "bun";
import { DEVICE_SESSION, WS_CLOSE } from "@owly/shared";
import { connectionManager, type WSContextData } from "./connection-manager.js";
import { handleClientEvent, endCurrentRoom, clearGeneralFallbackTimer } from "./events.js";
import { getUserState, setUserState } from "../matchmaking/state-machine.js";
import { removeFromQueue } from "../matchmaking/queue.js";
import { markOnline, markOffline } from "../services/online.js";
import {
  acquireDeviceSession,
  refreshDeviceSession,
  releaseDeviceSession,
} from "../services/device-session.js";
import { logEvent } from "../lib/logger.js";

function lockParams(ws: ServerWebSocket<WSContextData>) {
  return {
    sessionId: ws.data.sessionId,
    deviceId: ws.data.deviceId,
    ip: ws.data.ip,
  };
}

function rejectDeviceSession(ws: ServerWebSocket<WSContextData>) {
  ws.send(
    JSON.stringify({
      type: "error",
      data: {
        code: DEVICE_SESSION.ACTIVE_ERROR_CODE,
        message: DEVICE_SESSION.ACTIVE_MESSAGE,
      },
    })
  );
  ws.close(WS_CLOSE.DEVICE_SESSION_ACTIVE, "Device session active");
}

export const websocketHandler: WebSocketHandler<WSContextData> = {
  idleTimeout: 120,
  async open(ws: ServerWebSocket<WSContextData>) {
    let acquired = false;
    try {
      acquired = await acquireDeviceSession(lockParams(ws));
    } catch {
      logEvent({
        eventType: "device_session_error",
        sessionId: ws.data.sessionId,
        errorCode: "DEVICE_SESSION_LOCK_FAILED",
      });
      ws.close(1011, "Session lock unavailable");
      return;
    }

    if (!acquired) {
      logEvent({
        eventType: "device_session_rejected",
        sessionId: ws.data.sessionId,
        errorCode: DEVICE_SESSION.ACTIVE_ERROR_CODE,
      });
      rejectDeviceSession(ws);
      return;
    }

    ws.data.deviceLockHeld = true;
    connectionManager.register(ws.data.sessionId, ws);
    await markOnline(ws.data.sessionId);

    const existing = await getUserState(ws.data.sessionId);
    if (existing.state === "matched" && existing.roomId) {
      ws.data.roomId = existing.roomId;
      await setUserState(ws.data.sessionId, "matched", {
        roomId: existing.roomId,
      });
    } else if (existing.state === "queued") {
      await setUserState(ws.data.sessionId, "queued", {
        queuedAt: existing.queuedAt,
      });
    }
    // Do not write idle here: queue.join can run while open() is still awaiting
    // and a late idle write would leave the session in Redis queues as idle.

    ws.send(JSON.stringify({ type: "session.ready" }));

    logEvent({
      eventType: "ws_connected",
      sessionId: ws.data.sessionId,
      details: { ip: ws.data.ip },
    });
  },

  async message(ws: ServerWebSocket<WSContextData>, message: string | Buffer) {
    if (!ws.data.deviceLockHeld) return;

    try {
      await refreshDeviceSession(lockParams(ws));
    } catch {
      // TTL expiry remains the safety net if Redis is briefly unavailable.
    }
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
        details: { code, reason, replaced: connectionManager.has(sessionId) },
      });
      return;
    }

    await releaseDeviceSession(lockParams(ws));
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
