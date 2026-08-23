import pino from "pino";
import { env } from "../env.js";

export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  redact: {
    paths: ["req.headers.cookie", "req.headers.authorization", "password", "token"],
    remove: true,
  },
});

export function logEvent(params: {
  eventType: string;
  requestId?: string;
  sessionId?: string;
  roomId?: string;
  errorCode?: string;
  details?: Record<string, unknown>;
}) {
  logger.info({
    event: params.eventType,
    requestId: params.requestId,
    sessionId: params.sessionId,
    roomId: params.roomId,
    errorCode: params.errorCode,
    ...params.details,
  });
}
