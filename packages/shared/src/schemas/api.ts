import { z } from "zod";

// ─── Session API ─────────────────────────────────────────────────────────────

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

export const adminLoginResponseSchema = z.object({
  token: z.string(),
  expiresAt: z.string().datetime(),
});

export type AdminLoginResponse = z.infer<typeof adminLoginResponseSchema>;

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

// ─── Health ──────────────────────────────────────────────────────────────────

export const healthResponseSchema = z.object({
  status: z.enum(["ok", "degraded", "error"]),
  version: z.string(),
  uptime: z.number(),
  timestamp: z.string().datetime(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

// ─── Interest Tags ───────────────────────────────────────────────────────────

export const interestTagSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  category: z.string().optional(),
});

export type InterestTagDTO = z.infer<typeof interestTagSchema>;
