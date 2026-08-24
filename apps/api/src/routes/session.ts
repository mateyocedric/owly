import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { createSessionRequestSchema, type Gender } from "@owly/shared";
import { createAnonymousSession } from "../services/session.js";
import { env } from "../env.js";
import { createRateLimiter } from "../middleware/rate-limit.js";

export const sessionRouter = new Hono();

sessionRouter.post(
  "/session",
  createRateLimiter({
    keyPrefix: "session_create",
    limit:
      env.NODE_ENV === "production"
        ? env.RATE_LIMIT_CONNECTIONS_PER_HOUR
        : 10_000,
    windowSeconds: 3600,
  }),
  async (c) => {
    const ip =
      c.req.header("cf-connecting-ip") ||
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
      "127.0.0.1";
    const userAgent = c.req.header("user-agent");

    let interests: string[] = [];
    let gender: Gender | undefined;
    try {
      const body = await c.req.json();
      const parsed = createSessionRequestSchema.safeParse(body);
      if (parsed.success) {
        if (parsed.data.interests) {
          interests = parsed.data.interests;
        }
        gender = parsed.data.gender;
      }
    } catch {
      // Empty body is allowed
    }

    try {
      const { session, rawToken } = await createAnonymousSession(
        ip,
        userAgent,
        interests,
        gender
      );

      const crossOrigin = Boolean(env.CORS_ORIGINS);
      setCookie(c, "owly_session", rawToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production" || crossOrigin,
        sameSite: crossOrigin ? "None" : "Lax",
        maxAge: env.SESSION_TTL_SECONDS,
        path: "/",
        domain: env.COOKIE_DOMAIN || undefined,
      });

      return c.json({
        sessionId: session._id.toString(),
        token: rawToken, // Provided for non-cookie WebSocket handshakes
        expiresAt: session.expiresAt.toISOString(),
      });
    } catch (err: any) {
      return c.json({ error: err.message || "Failed to create session" }, 400);
    }
  }
);
