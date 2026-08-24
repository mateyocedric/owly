import { redis } from "../lib/redis.js";
import { REDIS_KEYS, type UserState } from "@owly/shared";

export interface SessionPresence {
  state: UserState;
  roomId?: string;
  queuedAt?: number;
  lastSeenAt: number;
}

export async function getUserState(sessionId: string): Promise<SessionPresence> {
  const data = await redis.get(`${REDIS_KEYS.PRESENCE}${sessionId}`);
  if (!data) {
    return { state: "idle", lastSeenAt: Date.now() };
  }
  try {
    return JSON.parse(data);
  } catch {
    return { state: "idle", lastSeenAt: Date.now() };
  }
}

export async function setUserState(
  sessionId: string,
  state: UserState,
  details?: { roomId?: string | null; queuedAt?: number }
) {
  const current = await getUserState(sessionId);
  const updated: SessionPresence = {
    ...current,
    state,
    roomId:
      details && "roomId" in details
        ? details.roomId ?? undefined
        : current.roomId,
    queuedAt: details?.queuedAt !== undefined ? details.queuedAt : current.queuedAt,
    lastSeenAt: Date.now(),
  };

  await redis.set(
    `${REDIS_KEYS.PRESENCE}${sessionId}`,
    JSON.stringify(updated),
    "EX",
    86400
  );
}

export async function clearUserState(sessionId: string) {
  await redis.del(`${REDIS_KEYS.PRESENCE}${sessionId}`);
}

/** Keep queue/room presence across a socket replace instead of forcing idle. */
export function presenceAfterReconnect(previous: SessionPresence): {
  state: UserState;
  roomId?: string | null;
} {
  if (previous.state === "queued") {
    return { state: "queued" };
  }
  if (previous.state === "matched" && previous.roomId) {
    return { state: "matched", roomId: previous.roomId };
  }
  return { state: "idle", roomId: null };
}
