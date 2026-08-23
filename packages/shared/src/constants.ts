/** Rate limits and timeouts configuration constants */

export const RATE_LIMITS = {
  /** Max messages per minute per session */
  MESSAGES_PER_MINUTE: 30,
  /** Penalty after spam is detected, in seconds */
  MESSAGE_COOLDOWN_SECONDS: 10,
  /** Messages closer together than this are treated as spam */
  MESSAGE_SPAM_INTERVAL_MS: 400,
  /** Rolling window used to detect message bursts */
  MESSAGE_BURST_WINDOW_MS: 3000,
  /** Messages allowed inside the burst window before a penalty */
  MESSAGE_BURST_LIMIT: 6,
  /** Max connections per IP per hour */
  CONNECTIONS_PER_HOUR: 20,
  /** Cooldown between "Next" skips in seconds */
  SKIP_COOLDOWN_SECONDS: 3,
  /** Max reports per session per hour */
  REPORTS_PER_HOUR: 10,
  /** Max message length in characters */
  MAX_MESSAGE_LENGTH: 2000,
  /** Min message length */
  MIN_MESSAGE_LENGTH: 1,
} as const;

export const MATCHMAKING = {
  /** Seconds to wait for interest-based match before falling back to random */
  INTEREST_TIMEOUT_SECONDS: 15,
  /** Reconnection grace period in seconds */
  RECONNECT_GRACE_SECONDS: 15,
  /** Max interests per session */
  MAX_INTERESTS: 5,
} as const;

export const SESSION = {
  /** Token expiry in seconds (default: 24 hours) */
  TTL_SECONDS: 86400,
  /** Token length in bytes */
  TOKEN_BYTES: 32,
} as const;

export const MODERATION = {
  /** Number of recent messages to capture in a report */
  REPORT_MESSAGE_COUNT: 20,
  /** Retention period for audit logs in days */
  AUDIT_LOG_RETENTION_DAYS: 90,
  /** Retention period for moderation reports in days */
  REPORT_RETENTION_DAYS: 365,
} as const;

export const REDIS_KEYS = {
  /** Main matchmaking queue */
  QUEUE_GENERAL: "owly:queue:general",
  /** Interest-specific queue prefix */
  QUEUE_INTEREST: "owly:queue:interest:",
  /** Session state hash prefix */
  SESSION_STATE: "owly:session:",
  /** Room ephemeral data prefix */
  ROOM_DATA: "owly:room:",
  /** Rate limit prefix */
  RATE_LIMIT: "owly:ratelimit:",
  /** Presence tracking */
  PRESENCE: "owly:presence:",
  /** Banned words set */
  BANNED_WORDS: "owly:config:banned_words",
} as const;

export const REPORT_CATEGORIES = [
  "spam",
  "scam",
  "sexual_exploitation",
  "threats",
  "hate_speech",
  "doxxing",
  "personal_info_request",
  "harassment",
  "underage",
  "other",
] as const;
export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

export const USER_STATES = [
  "idle",
  "queued",
  "matched",
  "disconnected",
  "banned",
] as const;
export type UserState = (typeof USER_STATES)[number];
