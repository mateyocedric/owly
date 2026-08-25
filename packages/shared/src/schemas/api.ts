import { z } from "zod";
import { GENDERS } from "../constants.js";

// ─── Session API ─────────────────────────────────────────────────────────────

export const createSessionRequestSchema = z.object({
  interests: z.array(z.string().max(50)).max(5).optional(),
  gender: z.enum(GENDERS).optional(),
});

export type CreateSessionRequest = z.infer<typeof createSessionRequestSchema>;

export const createSessionResponseSchema = z.object({
  sessionId: z.string(),
  expiresAt: z.string().datetime(),
});

export type CreateSessionResponse = z.infer<typeof createSessionResponseSchema>;

// ─── Report API ──────────────────────────────────────────────────────────────

export const submitReportRequestSchema = z.object({
  category: z.enum([
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
  ]),
  description: z.string().max(500).optional(),
  roomId: z.string(),
});

export type SubmitReportRequest = z.infer<typeof submitReportRequestSchema>;

// ─── Admin API ───────────────────────────────────────────────────────────────

export const adminLoginRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type AdminLoginRequest = z.infer<typeof adminLoginRequestSchema>;

export const adminSessionUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  role: z.enum(["moderator", "admin", "super_admin"]),
});

export type AdminSessionUser = z.infer<typeof adminSessionUserSchema>;

export const adminLoginResponseSchema = z.object({
  token: z.string(),
  expiresAt: z.string().datetime(),
  user: adminSessionUserSchema,
});

export type AdminLoginResponse = z.infer<typeof adminLoginResponseSchema>;

export const adminSessionResponseSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("authenticated"),
    user: adminSessionUserSchema,
  }),
  z.object({
    status: z.literal("unauthenticated"),
  }),
]);

export type AdminSessionResponse = z.infer<typeof adminSessionResponseSchema>;

export const updateReportStatusSchema = z.object({
  status: z.enum(["reviewing", "resolved", "dismissed"]),
  reason: z.string().max(500).optional(),
});

export type UpdateReportStatus = z.infer<typeof updateReportStatusSchema>;

export const moderateUserSchema = z.object({
  action: z.enum([
    "warning",
    "temporary_ban",
    "permanent_ban",
    "unban",
  ]),
  reason: z.string().max(500),
  /** Duration in hours, required for temporary bans */
  duration: z.number().int().positive().optional(),
});

export type ModerateUser = z.infer<typeof moderateUserSchema>;

function coercePositiveInt(value: unknown, fallback: number, max?: number): number {
  const raw =
    typeof value === "number"
      ? value
      : parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(raw) || raw < 1) return fallback;
  return max ? Math.min(raw, max) : raw;
}

export const adminListQuerySchema = z.object({
  page: z.unknown().transform((v) => coercePositiveInt(v, 1)),
  limit: z.unknown().transform((v) => coercePositiveInt(v, 25, 100)),
});

export type AdminListQuery = z.infer<typeof adminListQuerySchema>;

export const adminReportsListQuerySchema = adminListQuerySchema.extend({
  status: z
    .unknown()
    .transform((v) => {
      const s = typeof v === "string" && v.length > 0 ? v : "pending";
      return s;
    }),
});

export type AdminReportsListQuery = z.infer<typeof adminReportsListQuerySchema>;

export const adminUsersListQuerySchema = adminListQuerySchema.extend({
  status: z
    .unknown()
    .optional()
    .transform((v) => {
      if (typeof v !== "string" || v.length === 0) return undefined;
      return v;
    }),
});

export type AdminUsersListQuery = z.infer<typeof adminUsersListQuerySchema>;

// ─── Health ──────────────────────────────────────────────────────────────────

export const healthResponseSchema = z.object({
  status: z.enum(["ok", "degraded", "error"]),
  version: z.string(),
  uptime: z.number(),
  timestamp: z.string().datetime(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

// ─── Stats ───────────────────────────────────────────────────────────────────

export const onlineStatsResponseSchema = z.object({
  online: z.number().int().nonnegative(),
});

export type OnlineStatsResponse = z.infer<typeof onlineStatsResponseSchema>;

// ─── Interest Tags ───────────────────────────────────────────────────────────

export const interestTagSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  category: z.string().optional(),
});

export type InterestTagDTO = z.infer<typeof interestTagSchema>;
