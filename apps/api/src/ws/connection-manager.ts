import type { ServerWebSocket } from "bun";
import type { ServerEvent } from "@owly/shared";

export interface WSContextData {
  sessionId: string;
  ip: string;
  userAgent?: string;
  roomId?: string;
  interests?: string[];
  lastMessageTime?: number;
  messagePenaltyUntil?: number;
  recentMessageTimes?: number[];
  lastSkipTime?: number;
}

class ConnectionManager {
  private connections = new Map<string, ServerWebSocket<WSContextData>>();

  public register(sessionId: string, ws: ServerWebSocket<WSContextData>) {
    this.connections.set(sessionId, ws);
  }

  public unregister(sessionId: string) {
    this.connections.delete(sessionId);
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
