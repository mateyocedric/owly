import type { ServerWebSocket } from "bun";
import {
  clientEventSchema,
  type ClientEvent,
  type Gender,
  type ServerEvent,
  RATE_LIMITS,
  REDIS_KEYS,
} from "@owly/shared";
import { env } from "../env.js";
import { connectionManager, type WSContextData } from "./connection-manager.js";
import { redis } from "../lib/redis.js";
import {
  getUserState,
  setUserState,
} from "../matchmaking/state-machine.js";
import {
  addToQueue,
  addToGeneralQueue,
  removeFromQueue,
  getQueuePosition,
} from "../matchmaking/queue.js";
import { normalizeInterest } from "../matchmaking/policy.js";
import { tryAtomicMatch, restoreQueuedSession } from "../matchmaking/matcher.js";
import { tryInterestMatch } from "../matchmaking/interest-matcher.js";
import {
  createChatRoom,
  getRoomCache,
  appendMessageToRoomCache,
  closeChatRoom,
} from "../services/room.js";
import {
  checkContentModeration,
  submitModerationReport,
} from "../services/moderation.js";
import { blockUser } from "../services/block.js";
import { logEvent } from "../lib/logger.js";
import { touchOnline } from "../services/online.js";
import {
  evictEmptyMatchLooper,
  hasEmptyMatchLimit,
  hasRequeueCooldown,
  isLiveConnection,
  recordFinishedRoom,
  sessionSentMessage,
} from "../matchmaking/live-session.js";

export async function handleClientEvent(
  ws: ServerWebSocket<WSContextData>,
  rawMessage: string
) {
  let parsed: ClientEvent;
  try {
    const json = JSON.parse(rawMessage);
    const result = clientEventSchema.safeParse(json);
    if (!result.success) {
      const eventType =
        json && typeof json === "object" && typeof json.type === "string"
          ? json.type
          : undefined;
      const knownType = clientEventSchema.options.some(
        (option) => option.shape.type.value === eventType
      );

      // Newer clients may send events this API build does not know yet.
      // Ignore those instead of spamming "Invalid event structure" in chat.
      if (eventType && !knownType) {
        logEvent({
          eventType: "ws_unknown_event",
          sessionId: ws.data.sessionId,
          roomId: ws.data.roomId,
          details: { type: eventType },
        });
        return;
      }

      logEvent({
        eventType: "ws_invalid_event",
        sessionId: ws.data.sessionId,
        roomId: ws.data.roomId,
        errorCode: "INVALID_EVENT",
        details: { type: eventType },
      });
      ws.send(
        JSON.stringify({
          type: "error",
          data: { code: "INVALID_EVENT", message: "Invalid event structure" },
        })
      );
      return;
    }
    parsed = result.data;
  } catch {
    ws.send(
      JSON.stringify({
        type: "error",
        data: { code: "MALFORMED_JSON", message: "Payload must be valid JSON" },
      })
    );
    return;
  }

  const { sessionId } = ws.data;

  switch (parsed.type) {
    case "ping": {
      await touchOnline(sessionId);
      ws.send(JSON.stringify({ type: "pong" }));
      break;
    }

    case "queue.join": {
      await handleQueueJoin(ws, parsed.data?.interests, parsed.data?.gender);
      break;
    }

    case "queue.leave": {
      await handleQueueLeave(ws);
      break;
    }

    case "chat.message": {
      await handleChatMessage(ws, parsed.data.content);
      break;
    }

    case "chat.typing": {
      await handleChatTyping(ws);
      break;
    }

    case "chat.reaction": {
      await handleChatReaction(ws, parsed.data.id);
      break;
    }

    case "chat.next": {
      await handleChatNext(ws);
      break;
    }

    case "chat.stop": {
      await handleChatStop(ws);
      break;
    }

    case "chat.report": {
      await handleChatReport(ws, parsed.data.category, parsed.data.description);
      break;
    }

    case "chat.block": {
      await handleChatBlock(ws);
      break;
    }

    case "webrtc.signal": {
      await relayToPartner(ws, {
        type: "webrtc.signal",
        data: parsed.data,
      });
      break;
    }

    case "video.state": {
      await relayToPartner(ws, {
        type: "video.state",
        data: parsed.data,
      });
      break;
    }
  }
}

const generalFallbackTimers = new Map<string, ReturnType<typeof setTimeout>>();

export function clearGeneralFallbackTimer(sessionId: string) {
  const timer = generalFallbackTimers.get(sessionId);
  if (timer) {
    clearTimeout(timer);
    generalFallbackTimers.delete(sessionId);
  }
}

function scheduleGeneralFallback(sessionId: string) {
  clearGeneralFallbackTimer(sessionId);
  const delayMs = env.MATCHMAKING_INTEREST_TIMEOUT_SECONDS * 1000;
  const timer = setTimeout(() => {
    generalFallbackTimers.delete(sessionId);
    void runGeneralFallback(sessionId);
  }, delayMs);
  generalFallbackTimers.set(sessionId, timer);
}

async function isStillQueued(sessionId: string): Promise<boolean> {
  if (!connectionManager.has(sessionId)) return false;
  const state = await getUserState(sessionId);
  return state.state === "queued";
}

async function runGeneralFallback(sessionId: string) {
  if (!(await isStillQueued(sessionId))) return;

  const interests = connectionManager.get(sessionId)?.data.interests ?? [];

  if (interests.length > 0) {
    const interestMatch = await tryInterestMatch(sessionId, interests);
    if (interestMatch) {
      await establishMatch(interestMatch.pair, interestMatch.commonInterests);
      return;
    }
  }

  if (!(await isStillQueued(sessionId))) return;

  await addToGeneralQueue(sessionId);

  if (!(await isStillQueued(sessionId))) {
    await redis.zrem(REDIS_KEYS.QUEUE_GENERAL, sessionId);
    return;
  }

  const generalMatch = await tryAtomicMatch(sessionId);
  if (generalMatch) {
    await establishMatch(generalMatch);
  }
}

async function handleQueueJoin(
  ws: ServerWebSocket<WSContextData>,
  interests?: string[],
  gender?: Gender,
  options: { fromNext?: boolean } = {}
) {
  const { sessionId } = ws.data;
  if (ws.readyState !== 1) return;

  if (hasEmptyMatchLimit(sessionId)) {
    evictEmptyMatchLooper(sessionId);
    return;
  }

  if (!options.fromNext && hasRequeueCooldown(sessionId)) {
    ws.send(
      JSON.stringify({
        type: "error",
        data: {
          code: "SKIP_COOLDOWN",
          message: `Please wait ${RATE_LIMITS.SKIP_COOLDOWN_SECONDS}s before finding another match`,
        },
      })
    );
    return;
  }

  if (gender) {
    ws.data.gender = gender;
  }
  const state = await getUserState(sessionId);

  // If already queued, notify position
  if (state.state === "queued") {
    const pos = await getQueuePosition(sessionId);
    ws.send(JSON.stringify({ type: "queue.waiting", data: { position: pos } }));
    return;
  }

  // If currently in a room, leave it first
  if (state.state === "matched" && ws.data.roomId) {
    await endCurrentRoom(ws.data.roomId, sessionId, "next");
  }

  clearGeneralFallbackTimer(sessionId);
  ws.data.interests = (interests || []).map(normalizeInterest).filter(Boolean);
  await setUserState(sessionId, "queued", { queuedAt: Date.now() });

  const hasInterests = ws.data.interests.length > 0;
  await addToQueue(sessionId, ws.data.interests, { general: !hasInterests });

  const pos = await getQueuePosition(sessionId);
  ws.send(
    JSON.stringify({
      type: "queue.waiting",
      data: { position: pos || 1 },
    })
  );

  logEvent({ eventType: "queue_join", sessionId, details: { interests } });

  if (hasInterests) {
    const interestMatch = await tryInterestMatch(sessionId, ws.data.interests);
    if (interestMatch) {
      await establishMatch(interestMatch.pair, interestMatch.commonInterests);
      return;
    }
    scheduleGeneralFallback(sessionId);
    return;
  }

  const generalMatch = await tryAtomicMatch(sessionId);
  if (generalMatch) {
    await establishMatch(generalMatch);
  }
}

async function establishMatch(
  pair: [string, string],
  commonInterests?: string[]
) {
  const [u1, u2] = pair;
  const [s1, s2] = await Promise.all([getUserState(u1), getUserState(u2)]);
  const bothLive = isLiveConnection(u1) && isLiveConnection(u2);
  const bothQueued = s1.state === "queued" && s2.state === "queued";

  if (!bothLive || !bothQueued) {
    if (s1.state === "queued" && isLiveConnection(u1)) await restoreQueuedSession(u1);
    if (s2.state === "queued" && isLiveConnection(u2)) await restoreQueuedSession(u2);
    return;
  }

  clearGeneralFallbackTimer(u1);
  clearGeneralFallbackTimer(u2);

  // Clean up queues for both users
  await removeFromQueue(u1);
  await removeFromQueue(u2);

  const room = await createChatRoom(u1, u2, commonInterests);
  const roomId = room._id.toString();

  await setUserState(u1, "matched", { roomId });
  await setUserState(u2, "matched", { roomId });

  const ws1 = connectionManager.get(u1);
  if (ws1) ws1.data.roomId = roomId;

  const ws2 = connectionManager.get(u2);
  if (ws2) ws2.data.roomId = roomId;

  // u1 is the WebRTC offer initiator to avoid glare
  connectionManager.send(u1, {
    type: "match.found",
    data: {
      roomId,
      commonInterests,
      initiator: true,
      partnerGender: ws2?.data.gender,
    },
  });
  connectionManager.send(u2, {
    type: "match.found",
    data: {
      roomId,
      commonInterests,
      initiator: false,
      partnerGender: ws1?.data.gender,
    },
  });

  logEvent({
    eventType: "match_established",
    roomId,
    details: { users: pair, commonInterests },
  });
}

async function relayToPartner(
  ws: ServerWebSocket<WSContextData>,
  event: Extract<ServerEvent, { type: "webrtc.signal" | "video.state" }>
) {
  const { sessionId, roomId } = ws.data;
  if (!roomId) {
    ws.send(
      JSON.stringify({
        type: "error",
        data: { code: "NO_ACTIVE_ROOM", message: "You are not in a chat room" },
      })
    );
    return;
  }

  const room = await getRoomCache(roomId);
  if (!room) return;

  const partnerId = room.participants.find((p) => p !== sessionId);
  if (!partnerId) return;

  connectionManager.send(partnerId, event);
}

async function handleQueueLeave(ws: ServerWebSocket<WSContextData>) {
  const { sessionId } = ws.data;
  clearGeneralFallbackTimer(sessionId);
  await removeFromQueue(sessionId, ws.data.interests);
  await setUserState(sessionId, "idle", { roomId: null });
  ws.send(JSON.stringify({ type: "chat.ended", data: { reason: "stop" } }));
  logEvent({ eventType: "queue_leave", sessionId });
}

function sendRateLimited(
  ws: ServerWebSocket<WSContextData>,
  retryAfterSeconds: number
) {
  ws.send(
    JSON.stringify({
      type: "error",
      data: {
        code: "RATE_LIMITED",
        message: `Sending messages too fast. Wait ${retryAfterSeconds} seconds to send again.`,
        retryAfterSeconds,
      },
    })
  );
}

async function handleChatMessage(
  ws: ServerWebSocket<WSContextData>,
  content: string
) {
  const { sessionId, roomId } = ws.data;
  if (!roomId) {
    ws.send(
      JSON.stringify({
        type: "error",
        data: { code: "NO_ACTIVE_ROOM", message: "You are not in a chat room" },
      })
    );
    return;
  }

  // Rate limiting: allow normal chat, penalize only rapid spam
  const now = Date.now();
  const penaltyMs = RATE_LIMITS.MESSAGE_COOLDOWN_SECONDS * 1000;

  if (ws.data.messagePenaltyUntil && now < ws.data.messagePenaltyUntil) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((ws.data.messagePenaltyUntil - now) / 1000)
    );
    sendRateLimited(ws, retryAfterSeconds);
    return;
  }

  const recent = (ws.data.recentMessageTimes ?? []).filter(
    (t) => now - t < RATE_LIMITS.MESSAGE_BURST_WINDOW_MS
  );
  const tooFast =
    ws.data.lastMessageTime != null &&
    now - ws.data.lastMessageTime < RATE_LIMITS.MESSAGE_SPAM_INTERVAL_MS;
  const bursting = recent.length >= RATE_LIMITS.MESSAGE_BURST_LIMIT;

  if (tooFast || bursting) {
    ws.data.messagePenaltyUntil = now + penaltyMs;
    sendRateLimited(ws, RATE_LIMITS.MESSAGE_COOLDOWN_SECONDS);
    return;
  }

  ws.data.lastMessageTime = now;
  recent.push(now);
  ws.data.recentMessageTimes = recent;

  // Safety & content moderation check
  const modResult = await checkContentModeration(content);
  if (modResult.flagged) {
    ws.send(
      JSON.stringify({
        type: "moderation.warning",
        data: { message: modResult.reason || "Message blocked by safety filter" },
      })
    );
    logEvent({
      eventType: "message_blocked_moderation",
      sessionId,
      roomId,
      details: { reason: modResult.reason },
    });
    return;
  }

  const room = await getRoomCache(roomId);
  if (!room) return;

  const partnerId = room.participants.find((p) => p !== sessionId);
  if (!partnerId) return;

  // Append to ephemeral cache
  await appendMessageToRoomCache(roomId, sessionId, content);

  const timestamp = new Date().toISOString();

  // Send message to partner
  connectionManager.send(partnerId, {
    type: "chat.message",
    data: { content, timestamp },
  });
}

async function handleChatTyping(ws: ServerWebSocket<WSContextData>) {
  const { sessionId, roomId } = ws.data;
  if (!roomId) return;

  const room = await getRoomCache(roomId);
  if (!room) return;

  const partnerId = room.participants.find((p) => p !== sessionId);
  if (partnerId) {
    connectionManager.send(partnerId, { type: "chat.typing" });
  }
}

async function handleChatReaction(
  ws: ServerWebSocket<WSContextData>,
  reactionId: Extract<ClientEvent, { type: "chat.reaction" }>["data"]["id"]
) {
  const { sessionId, roomId } = ws.data;
  if (!roomId) return;

  const now = Date.now();
  const recent = (ws.data.recentReactionTimes ?? []).filter(
    (t) => now - t < RATE_LIMITS.REACTION_BURST_WINDOW_MS
  );
  const tooFast =
    ws.data.lastReactionTime != null &&
    now - ws.data.lastReactionTime < RATE_LIMITS.REACTION_MIN_INTERVAL_MS;
  const bursting = recent.length >= RATE_LIMITS.REACTION_BURST_LIMIT;

  // Silently drop spam — do not send RATE_LIMITED (that path affects chat messages).
  if (tooFast || bursting) return;

  ws.data.lastReactionTime = now;
  recent.push(now);
  ws.data.recentReactionTimes = recent;

  const room = await getRoomCache(roomId);
  if (!room) return;

  const partnerId = room.participants.find((p) => p !== sessionId);
  if (partnerId) {
    connectionManager.send(partnerId, {
      type: "chat.reaction",
      data: { id: reactionId },
    });
  }
}

async function handleChatNext(ws: ServerWebSocket<WSContextData>) {
  const { sessionId, roomId } = ws.data;

  const now = Date.now();
  const onCooldown = !!(
    ws.data.lastSkipTime &&
    now - ws.data.lastSkipTime < RATE_LIMITS.SKIP_COOLDOWN_SECONDS * 1000
  );

  // Always leave the current room first. Cooldown only delays requeue —
  // the partner must still be told this session left.
  if (roomId) {
    await endCurrentRoom(roomId, sessionId, "next");
  }

  if (onCooldown) {
    ws.send(
      JSON.stringify({
        type: "error",
        data: {
          code: "SKIP_COOLDOWN",
          message: `Please wait ${RATE_LIMITS.SKIP_COOLDOWN_SECONDS}s before finding another match`,
        },
      })
    );
    return;
  }
  ws.data.lastSkipTime = now;

  // Automatically requeue
  await handleQueueJoin(ws, ws.data.interests, undefined, { fromNext: true });
}

async function handleChatStop(ws: ServerWebSocket<WSContextData>) {
  const { sessionId, roomId } = ws.data;
  if (roomId) {
    await endCurrentRoom(roomId, sessionId, "stop");
  }
  clearGeneralFallbackTimer(sessionId);
  await removeFromQueue(sessionId, ws.data.interests);
  await setUserState(sessionId, "idle", { roomId: null });
  ws.send(JSON.stringify({ type: "chat.ended", data: { reason: "stop" } }));
}

async function handleChatReport(
  ws: ServerWebSocket<WSContextData>,
  category: any,
  description?: string
) {
  const { sessionId, roomId } = ws.data;
  if (!roomId) return;

  try {
    await submitModerationReport({
      reporterSessionId: sessionId,
      roomId,
      category,
      description,
    });

    // End chat room on report
    await endCurrentRoom(roomId, sessionId, "report");
    await setUserState(sessionId, "idle", { roomId: null });

    ws.send(
      JSON.stringify({
        type: "chat.ended",
        data: { reason: "report" },
      })
    );
  } catch (err: any) {
    ws.send(
      JSON.stringify({
        type: "error",
        data: { code: "REPORT_FAILED", message: err.message },
      })
    );
  }
}

async function handleChatBlock(ws: ServerWebSocket<WSContextData>) {
  const { sessionId, roomId } = ws.data;
  if (!roomId) return;

  const room = await getRoomCache(roomId);
  if (!room) return;

  const partnerId = room.participants.find((p) => p !== sessionId);
  if (partnerId) {
    await blockUser(sessionId, partnerId);
  }

  await endCurrentRoom(roomId, sessionId, "stop");
  await setUserState(sessionId, "idle", { roomId: null });
  ws.send(JSON.stringify({ type: "chat.ended", data: { reason: "stop" } }));
}

export async function endCurrentRoom(
  roomId: string,
  initiatorSessionId: string,
  reason: "next" | "stop" | "disconnect" | "report" | "moderation"
) {
  const room = await getRoomCache(roomId);
  if (!room) return;

  await closeChatRoom(
    roomId,
    reason === "disconnect" ? "partner_left" : reason
  );

  const partnerId = room.participants.find((p) => p !== initiatorSessionId);
  recordFinishedRoom(initiatorSessionId, sessionSentMessage(initiatorSessionId, room));
  if (partnerId) {
    recordFinishedRoom(partnerId, sessionSentMessage(partnerId, room));
  }

  if (partnerId) {
    await setUserState(partnerId, "idle", { roomId: null });
    const partnerWs = connectionManager.get(partnerId);
    if (partnerWs) {
      partnerWs.data.roomId = undefined;
    }
    connectionManager.send(partnerId, {
      type: "chat.partner_left",
      data: { reason },
    });
  }

  const initiatorWs = connectionManager.get(initiatorSessionId);
  if (initiatorWs) {
    initiatorWs.data.roomId = undefined;
  }

  if (hasEmptyMatchLimit(initiatorSessionId)) {
    evictEmptyMatchLooper(initiatorSessionId);
  }
  if (partnerId && hasEmptyMatchLimit(partnerId)) {
    evictEmptyMatchLooper(partnerId);
  }
}
