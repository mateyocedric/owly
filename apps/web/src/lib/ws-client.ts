import { DEVICE_SESSION, WS_CLOSE, type ClientEvent, type ServerEvent } from "@owly/shared";
import { websocketUrl } from "./config.js";
import { getDeviceId } from "./device-id.js";

type EventListener = (event: ServerEvent) => void;
type CloseListener = (code: number) => void;

export class OwlyWSConnectError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "OwlyWSConnectError";
    this.code = code;
  }
}

export function isDeviceSessionActiveError(
  error: unknown
): error is OwlyWSConnectError {
  return (
    error instanceof OwlyWSConnectError &&
    error.code === DEVICE_SESSION.ACTIVE_ERROR_CODE
  );
}

export class OwlyWSClient {
  private ws: WebSocket | null = null;
  private listeners: Set<EventListener> = new Set();
  private closeListeners: Set<CloseListener> = new Set();
  private reconnectTimer: number | null = null;
  private pingInterval: number | null = null;
  private token: string | null = null;
  private manualClose = false;
  private didOpen = false;
  private sessionReady = false;
  private connectPromise: Promise<void> | null = null;

  constructor(token?: string) {
    if (token) this.token = token;
  }

  public setToken(token: string) {
    this.token = token;
  }

  public connect(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.sessionReady) {
      return Promise.resolve();
    }

    if (
      this.connectPromise &&
      this.ws &&
      this.ws.readyState === WebSocket.CONNECTING
    ) {
      return this.connectPromise;
    }

    if (
      this.connectPromise &&
      this.ws &&
      this.ws.readyState === WebSocket.OPEN &&
      !this.sessionReady
    ) {
      return this.connectPromise;
    }

    this.manualClose = false;
    this.didOpen = false;
    this.sessionReady = false;

    this.connectPromise = new Promise((resolve, reject) => {
      let settled = false;
      const url = websocketUrl(this.token, getDeviceId());
      this.ws = new WebSocket(url);

      const settle = (fn: () => void) => {
        if (settled) return;
        settled = true;
        this.connectPromise = null;
        fn();
      };

      this.ws.onopen = () => {
        this.didOpen = true;
      };

      this.ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data) as ServerEvent;
          if (parsed.type === "session.ready") {
            this.sessionReady = true;
            this.startHeartbeat();
            settle(() => resolve());
          } else if (
            parsed.type === "error" &&
            parsed.data.code === DEVICE_SESSION.ACTIVE_ERROR_CODE
          ) {
            settle(() =>
              reject(
                new OwlyWSConnectError(
                  parsed.data.code,
                  parsed.data.message
                )
              )
            );
          }
          this.emit(parsed);
        } catch (err) {
          console.error("Failed to parse WS message", err);
        }
      };

      this.ws.onerror = (err) => {
        settle(() => reject(err));
      };

      this.ws.onclose = (event) => {
        this.stopHeartbeat();
        this.sessionReady = false;
        const shouldNotify = this.didOpen && !this.manualClose && settled;
        this.didOpen = false;
        this.ws = null;
        if (!settled) {
          settle(() => {
            if (event.code === WS_CLOSE.DEVICE_SESSION_ACTIVE) {
              reject(
                new OwlyWSConnectError(
                  DEVICE_SESSION.ACTIVE_ERROR_CODE,
                  DEVICE_SESSION.ACTIVE_MESSAGE
                )
              );
              return;
            }
            reject(new Error("WebSocket closed before the session was ready"));
          });
          return;
        }
        this.connectPromise = null;
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
    this.sessionReady = false;
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
