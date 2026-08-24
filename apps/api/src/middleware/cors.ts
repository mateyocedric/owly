import { cors } from "hono/cors";
import { env } from "../env.js";

function expandOrigins(origins: string[]): Set<string> {
  const allowed = new Set(origins);
  for (const origin of origins) {
    try {
      const url = new URL(origin);
      if (url.hostname.startsWith("www.")) {
        url.hostname = url.hostname.slice(4);
      } else {
        url.hostname = `www.${url.hostname}`;
      }
      allowed.add(url.origin);
    } catch {
      // Ignore invalid origin entries
    }
  }
  return allowed;
}

const allowedOrigins = expandOrigins(
  env.CORS_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
);

export const corsMiddleware = cors({
  origin: (origin) => {
    if (!origin) return origin;
    if (allowedOrigins.size === 0) return origin;
    return allowedOrigins.has(origin) ? origin : "";
  },
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "x-request-id"],
  exposeHeaders: ["x-request-id"],
});
