import { z } from "zod";

export const envSchema = z.object({
  // MongoDB
  MONGODB_URI: z.string().url(),

  // Redis
  REDIS_URL: z.string().url(),

  // API Server
  API_PORT: z.coerce.number().int().positive().default(3001),
  API_HOST: z.string().default("0.0.0.0"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

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
