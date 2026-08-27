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
  /** Min interval between live video reactions */
  REACTION_MIN_INTERVAL_MS: 400,
  /** Rolling window used to detect reaction bursts */
  REACTION_BURST_WINDOW_MS: 3000,
  /** Reactions allowed inside the burst window before extras are dropped */
  REACTION_BURST_LIMIT: 8,
} as const;

/** ASCII ids on the wire so production JSON/Zod never depend on emoji encoding. */
export const CHAT_REACTION_IDS = [
  "thumbs_up",
  "heart",
  "laugh",
  "wow",
  "sad",
  "fire",
] as const;
export type ChatReactionId = (typeof CHAT_REACTION_IDS)[number];

export const CHAT_REACTION_BY_ID = {
  thumbs_up: { emoji: "👍", label: "Thumbs up" },
  heart: { emoji: "❤️", label: "Heart" },
  laugh: { emoji: "😂", label: "Laugh" },
  wow: { emoji: "😮", label: "Surprised" },
  sad: { emoji: "😢", label: "Sad" },
  fire: { emoji: "🔥", label: "Fire" },
} as const satisfies Record<ChatReactionId, { emoji: string; label: string }>;

export const GENDERS = ["male", "female", "other"] as const;
export type Gender = (typeof GENDERS)[number];

export const GENDER_LABELS = {
  male: "Male",
  female: "Female",
  other: "Other",
} as const satisfies Record<Gender, string>;

/** Matchmaking / session mode: text-only vs video chat */
export const CHAT_MODES = ["text", "video"] as const;
export type ChatMode = (typeof CHAT_MODES)[number];

export const MATCHMAKING = {
  /** Seconds to wait for interest-based match before falling back to random */
  INTEREST_TIMEOUT_SECONDS: 15,
  /** Reconnection grace period in seconds */
  RECONNECT_GRACE_SECONDS: 15,
  /** Max interests per session */
  MAX_INTERESTS: 5,
  /** Close a socket after this many finished rooms with no messages sent */
  EMPTY_MATCH_STREAK_LIMIT: 8,
  /** Client-side cap on automatic requeues after a dropped connection */
  MAX_AUTO_REQUEUES: 3,
} as const;

/** Local-camera face presence during an active video session */
export const FACE_PRESENCE = {
  /** Seconds without a visible face before the session ends */
  ABSENCE_TIMEOUT_SECONDS: 10,
  /** How often to run face detection while the session is active */
  DETECTION_INTERVAL_MS: 400,
  /** Consecutive misses required before starting the grace-period warning */
  MISS_STREAK_BEFORE_WARNING: 2,
  /** Ignore detection results for this long after enabling (black frames) */
  WARMUP_MS: 1000,
} as const;

export const WS_CLOSE = {
  REPLACED: 4000,
  EMPTY_MATCH_LIMIT: 4001,
  DEVICE_SESSION_ACTIVE: 4002,
} as const;

/** One live WebSocket session per browser device id (Redis TTL lock). */
export const DEVICE_SESSION = {
  /** Lock TTL; must outlive a missed ping and match Bun idleTimeout. */
  TTL_SECONDS: 120,
  ACTIVE_ERROR_CODE: "DEVICE_SESSION_ACTIVE",
  ACTIVE_MESSAGE: "You already have an active session on this device.",
} as const;

const DEVICE_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidDeviceId(value: string): boolean {
  return DEVICE_ID_PATTERN.test(value);
}

export const SESSION = {
  /** Token expiry in seconds (default: 24 hours) */
  TTL_SECONDS: 86400,
  /** Token length in bytes */
  TOKEN_BYTES: 32,
} as const;

export const ONLINE_PRESENCE = {
  /** Drop sessions with no heartbeat within this window */
  STALE_MS: 90_000,
  /** Shared Redis cache TTL for GET /api/stats/online */
  COUNT_CACHE_SECONDS: 10,
  /** Lock TTL while one instance recomputes the count */
  COUNT_LOCK_SECONDS: 2,
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
  /** Main matchmaking queue (video mode; legacy key) */
  QUEUE_GENERAL: "owly:queue:general",
  /** Interest-specific queue prefix (video mode; legacy key) */
  QUEUE_INTEREST: "owly:queue:interest:",
  /** Set of interest slugs a queued session currently occupies (video mode) */
  QUEUE_SESSION_INTERESTS: "owly:queue:session-interests:",
  /** Text-mode general queue */
  QUEUE_TEXT_GENERAL: "owly:queue:text:general",
  /** Text-mode interest-specific queue prefix */
  QUEUE_TEXT_INTEREST: "owly:queue:text:interest:",
  /** Text-mode set of interest slugs a queued session occupies */
  QUEUE_TEXT_SESSION_INTERESTS: "owly:queue:text:session-interests:",
  /** Session state hash prefix */
  SESSION_STATE: "owly:session:",
  /** Room ephemeral data prefix */
  ROOM_DATA: "owly:room:",
  /** Rate limit prefix */
  RATE_LIMIT: "owly:ratelimit:",
  /** Presence tracking */
  PRESENCE: "owly:presence:",
  /** Unique WebSocket-connected sessions (ZSET, score = last seen ms) */
  ONLINE_SESSIONS: "owly:online",
  /** Cached online count (string integer, short TTL) */
  ONLINE_COUNT_CACHE: "owly:online:count",
  /** Lock while recomputing online count */
  ONLINE_COUNT_LOCK: "owly:online:count:lock",
  /** Banned words set */
  BANNED_WORDS: "owly:config:banned_words",
  /** Active device session lock prefix */
  ACTIVE_DEVICE: "owly:active-device:",
  /** Temporary active-session lock by hashed IP (optional) */
  ACTIVE_IP: "owly:active-ip:",
} as const;

/** Redis key prefixes for a chat mode (video keeps legacy keys). */
export function queueKeys(mode: ChatMode = "video") {
  if (mode === "text") {
    return {
      general: REDIS_KEYS.QUEUE_TEXT_GENERAL,
      interest: REDIS_KEYS.QUEUE_TEXT_INTEREST,
      sessionInterests: REDIS_KEYS.QUEUE_TEXT_SESSION_INTERESTS,
    };
  }
  return {
    general: REDIS_KEYS.QUEUE_GENERAL,
    interest: REDIS_KEYS.QUEUE_INTEREST,
    sessionInterests: REDIS_KEYS.QUEUE_SESSION_INTERESTS,
  };
}

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
