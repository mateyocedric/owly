import { ChatRoom, type IChatRoom, type CloseReason } from "@owly/database";
import { redis } from "../lib/redis.js";
import { REDIS_KEYS } from "@owly/shared";
import mongoose from "mongoose";

export interface ActiveRoomCache {
  roomId: string;
  participants: [string, string];
  commonInterests?: string[];
  createdAt: number;
  recentMessages: Array<{
    senderSessionId: string;
    content: string;
    timestamp: string;
  }>;
}

export async function createChatRoom(
  sessionId1: string,
  sessionId2: string,
  commonInterests?: string[]
): Promise<IChatRoom> {
  const room = await ChatRoom.create({
    status: "active",
    participants: [
      { sessionId: new mongoose.Types.ObjectId(sessionId1), joinedAt: new Date() },
      { sessionId: new mongoose.Types.ObjectId(sessionId2), joinedAt: new Date() },
    ],
  });

  const cacheData: ActiveRoomCache = {
    roomId: room._id.toString(),
    participants: [sessionId1, sessionId2],
    commonInterests,
    createdAt: Date.now(),
    recentMessages: [],
  };

  // Cache room in Redis with 1 hour TTL
  await redis.set(
    `${REDIS_KEYS.ROOM_DATA}${room._id}`,
    JSON.stringify(cacheData),
    "EX",
    3600
  );

  return room;
}

export async function getRoomCache(
  roomId: string
): Promise<ActiveRoomCache | null> {
  const data = await redis.get(`${REDIS_KEYS.ROOM_DATA}${roomId}`);
  if (!data) return null;
  try {
    return JSON.parse(data) as ActiveRoomCache;
  } catch {
    return null;
  }
}

export async function appendMessageToRoomCache(
  roomId: string,
  senderSessionId: string,
  content: string
) {
  const cache = await getRoomCache(roomId);
  if (!cache) return;

  cache.recentMessages.push({
    senderSessionId,
    content,
    timestamp: new Date().toISOString(),
  });

  // Retain only last 25 messages in ephemeral cache
  if (cache.recentMessages.length > 25) {
    cache.recentMessages.shift();
  }

  await redis.set(
    `${REDIS_KEYS.ROOM_DATA}${roomId}`,
    JSON.stringify(cache),
    "EX",
    3600
  );
}

export async function closeChatRoom(
  roomId: string,
  reason: CloseReason
): Promise<void> {
  await ChatRoom.updateOne(
    { _id: new mongoose.Types.ObjectId(roomId), status: "active" },
    {
      status: "closed",
      closeReason: reason,
      closedAt: new Date(),
    }
  );

  // Keep room cache briefly for report submission grace period (5 mins), then let it expire
  const cache = await getRoomCache(roomId);
  if (cache) {
    await redis.set(
      `${REDIS_KEYS.ROOM_DATA}${roomId}`,
      JSON.stringify(cache),
      "EX",
      300
    );
  }
}
