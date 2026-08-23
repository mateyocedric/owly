import crypto from "node:crypto";
import { env } from "../env.js";

/**
 * Generate cryptographically secure random session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hash session token using HMAC-SHA256 with server secret
 */
export function hashToken(token: string): string {
  return crypto
    .createHmac("sha256", env.SESSION_SECRET)
    .update(token)
    .digest("hex");
}

/**
 * Hash IP address for privacy-safe identification and rate-limiting
 */
export function hashIP(ip: string): string {
  return crypto
    .createHmac("sha256", env.SESSION_SECRET)
    .update(ip)
    .digest("hex");
}
