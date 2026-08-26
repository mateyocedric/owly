import { z } from "zod";

export const envSchema = z.object({
  // MongoDB (plain string so passwords with special chars still parse)
  MONGODB_URI: z.string().min(1),

  // Redis
  REDIS_URL: z.string().min(1),

  // API Server
  API_PORT: z.coerce.number().int().positive().default(3001),
  API_HOST: z.string().default("0.0.0.0"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  // Comma-separated browser origins. Empty = reflect the request origin.
  CORS_ORIGINS: z.string().optional().default(""),

  // Session & Security
  SESSION_SECRET: z.string().min(32),
  SESSION_TTL_SECONDS: z.coerce.number().int().positive().default(86400),
  COOKIE_DOMAIN: z.string().optional().default(""),

  // Admin
  ADMIN_JWT_SECRET: z.string().min(32),

  // Rate Limiting
  RATE_LIMIT_MESSAGES_PER_MINUTE: z.coerce.number().int().positive().default(30),
  RATE_LIMIT_CONNECTIONS_PER_HOUR: z.coerce.number().int().positive().default(20),
  RATE_LIMIT_SKIP_COOLDOWN_SECONDS: z.coerce.number().int().positive().default(3),
  RATE_LIMIT_REPORTS_PER_HOUR: z.coerce.number().int().positive().default(10),

  // Matchmaking
  MATCHMAKING_INTEREST_TIMEOUT_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(15),
  MATCHMAKING_RECONNECT_GRACE_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(15),

  // Single active device session (Redis TTL locks)
  DEVICE_SESSION_TTL_SECONDS: z.coerce.number().int().positive().default(120),
  DEVICE_SESSION_IP_LOCK_ENABLED: z.preprocess(
    (value) => value === true || value === "true" || value === "1",
    z.boolean().default(false)
  ),

  // Moderation
  MODERATION_REPORT_MESSAGE_COUNT: z.coerce
    .number()
    .int()
    .positive()
    .default(20),
  AUDIT_LOG_RETENTION_DAYS: z.coerce.number().int().positive().default(90),
  REPORT_RETENTION_DAYS: z.coerce.number().int().positive().default(365),
});

export type EnvConfig = z.infer<typeof envSchema>;
