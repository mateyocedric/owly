import { AnonymousSession, type IAnonymousSession, BanRecord } from "@owly/database";
import { REDIS_KEYS, type Gender } from "@owly/shared";
import { generateSessionToken, hashToken, hashIP } from "../lib/token.js";
import { env } from "../env.js";
import { redis } from "../lib/redis.js";

export interface CreateSessionResult {
  session: IAnonymousSession;
  rawToken: string;
}

export async function createAnonymousSession(
  ip: string,
  userAgent?: string,
  interests: string[] = [],
  gender?: Gender
): Promise<CreateSessionResult> {
  const ipHash = hashIP(ip);

  // Check if IP is banned
  const ban = await BanRecord.findOne({
    ipHash,
    $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
  });

  if (ban) {
    throw new Error(`Access restricted: ${ban.reason}`);
  }

  const rawToken = generateSessionToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + env.SESSION_TTL_SECONDS * 1000);

  const session = await AnonymousSession.create({
    tokenHash,
    status: "active",
    ipHash,
    userAgent,
    interests,
    ...(gender ? { gender } : {}),
    expiresAt,
    lastActiveAt: new Date(),
  });

  // Store active session token mapping in Redis for sub-millisecond lookup
  await redis.set(
    `${REDIS_KEYS.SESSION_STATE}${session._id}`,
    JSON.stringify({
      id: session._id.toString(),
      status: session.status,
      ipHash,
      tokenHash,
    }),
    "EX",
    env.SESSION_TTL_SECONDS
  );

  return { session, rawToken };
}

export async function validateSessionToken(
  rawToken: string
): Promise<IAnonymousSession | null> {
  const tokenHash = hashToken(rawToken);
  const session = await AnonymousSession.findOne({
    tokenHash,
    expiresAt: { $gt: new Date() },
  });

  if (!session) return null;
  if (session.status === "permanently_banned" || session.status === "temporarily_banned") {
    return null;
  }

  // Update last active in background
  AnonymousSession.updateOne(
    { _id: session._id },
    { lastActiveAt: new Date() }
  ).exec();

  return session;
}
