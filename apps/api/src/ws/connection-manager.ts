import type { ServerWebSocket } from "bun";
import { WS_CLOSE, type ChatMode, type Gender, type ServerEvent } from "@owly/shared";

export interface WSContextData {
  sessionId: string;
  ip: string;
  deviceId?: string;
  deviceLockHeld?: boolean;
  userAgent?: string;
  roomId?: string;
  interests?: string[];
  gender?: Gender;
  /** Matchmaking mode; defaults to video for legacy clients */
  mode?: ChatMode;
  lastMessageTime?: number;
  messagePenaltyUntil?: number;
  recentMessageTimes?: number[];
  lastSkipTime?: number;
  lastReactionTime?: number;
  recentReactionTimes?: number[];
  lastRoomEndedAt?: number;
  emptyMatchStreak?: number;
}

class ConnectionManager {
  private connections = new Map<string, ServerWebSocket<WSContextData>>();

  public register(sessionId: string, ws: ServerWebSocket<WSContextData>) {
    const existing = this.connections.get(sessionId);
    this.connections.set(sessionId, ws);
    if (existing && existing !== ws) {
      existing.close(WS_CLOSE.REPLACED, "Replaced by newer connection");
    }
  }

  public isLive(sessionId: string): boolean {
    const ws = this.connections.get(sessionId);
    return !!ws && ws.readyState === 1;
  }

  /** Returns true when this socket was the active connection and the session went offline. */
  public unregister(
    sessionId: string,
    ws: ServerWebSocket<WSContextData>
  ): boolean {
    const current = this.connections.get(sessionId);
    if (current !== ws) {
      return false;
    }
    this.connections.delete(sessionId);
    return true;
  }

  public get(sessionId: string): ServerWebSocket<WSContextData> | undefined {
    return this.connections.get(sessionId);
  }

  public has(sessionId: string): boolean {
    return this.connections.has(sessionId);
  }

  public send(sessionId: string, event: ServerEvent) {
    const ws = this.connections.get(sessionId);
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify(event));
    }
  }

  public broadcast(sessionIds: string[], event: ServerEvent) {
    const json = JSON.stringify(event);
    for (const sid of sessionIds) {
      const ws = this.connections.get(sid);
      if (ws && ws.readyState === 1) {
        ws.send(json);
      }
    }
  }

  public get count(): number {
    return this.connections.size;
  }
}

export const connectionManager = new ConnectionManager();
