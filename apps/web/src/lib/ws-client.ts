import type { ClientEvent, ServerEvent } from "@owly/shared";
import { websocketUrl } from "./config.js";

type EventListener = (event: ServerEvent) => void;
type CloseListener = (code: number) => void;

export class OwlyWSClient {
  private ws: WebSocket | null = null;
  private listeners: Set<EventListener> = new Set();
  private closeListeners: Set<CloseListener> = new Set();
  private reconnectTimer: number | null = null;
  private pingInterval: number | null = null;
  private token: string | null = null;
  private manualClose = false;
  private didOpen = false;
  private connectPromise: Promise<void> | null = null;

  constructor(token?: string) {
    if (token) this.token = token;
  }

  public setToken(token: string) {
    this.token = token;
  }

  public connect(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    if (
      this.connectPromise &&
      this.ws &&
      this.ws.readyState === WebSocket.CONNECTING
    ) {
      return this.connectPromise;
    }

    this.manualClose = false;
    this.didOpen = false;

    this.connectPromise = new Promise((resolve, reject) => {
      const url = websocketUrl(this.token);
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.didOpen = true;
        this.connectPromise = null;
        this.startHeartbeat();
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data) as ServerEvent;
          this.emit(parsed);
        } catch (err) {
          console.error("Failed to parse WS message", err);
        }
      };

      this.ws.onerror = (err) => {
        this.connectPromise = null;
        reject(err);
      };

      this.ws.onclose = (event) => {
        this.stopHeartbeat();
        const shouldNotify = this.didOpen && !this.manualClose;
        this.didOpen = false;
        this.connectPromise = null;
        this.ws = null;
        if (shouldNotify) {
          for (const listener of this.closeListeners) listener(event.code);
        }
      };
    });

    return this.connectPromise;
  }

  public send(event: ClientEvent) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    } else {
      console.warn("WebSocket not connected. Unable to send event:", event.type);
    }
  }

  public on(listener: EventListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public onClose(listener: CloseListener) {
    this.closeListeners.add(listener);
    return () => this.closeListeners.delete(listener);
  }

  private emit(event: ServerEvent) {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.pingInterval = window.setInterval(() => {
      this.send({ type: "ping" });
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  public disconnect() {
    this.manualClose = true;
    this.connectPromise = null;
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
