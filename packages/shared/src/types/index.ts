export type { Gender } from "../constants.js";

export type ConnectionState =
  | "idle"
  | "finding"
  | "connected"
  | "disconnected"
  | "partner_left"
  | "error";

export interface ChatMessage {
  id: string;
  content: string;
  sender: "self" | "partner" | "system";
  timestamp: Date;
}

export interface SessionInfo {
  sessionId: string;
  expiresAt: Date;
}

export interface RoomInfo {
  roomId: string;
  commonInterests?: string[];
}
