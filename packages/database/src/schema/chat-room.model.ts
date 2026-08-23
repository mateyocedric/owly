import mongoose, { type Document, Schema, type Types } from "mongoose";

export const ROOM_STATUSES = ["active", "closed"] as const;
export type RoomStatus = (typeof ROOM_STATUSES)[number];

export const CLOSE_REASONS = [
  "both_left",
  "partner_left",
  "next",
  "stop",
  "report",
  "timeout",
  "error",
  "moderation",
] as const;
export type CloseReason = (typeof CLOSE_REASONS)[number];

export interface IChatRoomParticipant {
  sessionId: Types.ObjectId;
  joinedAt: Date;
  leftAt?: Date;
}

export interface IChatRoom extends Document {
  _id: Types.ObjectId;
  status: RoomStatus;
  participants: IChatRoomParticipant[];
  closeReason?: CloseReason;
  createdAt: Date;
  closedAt?: Date;
}

const chatRoomSchema = new Schema<IChatRoom>(
  {
    status: {
      type: String,
      enum: ROOM_STATUSES,
      default: "active",
      required: true,
      index: true,
    },
    participants: [
      {
        sessionId: {
          type: Schema.Types.ObjectId,
          ref: "AnonymousSession",
          required: true,
        },
        joinedAt: { type: Date, default: Date.now },
        leftAt: { type: Date },
      },
    ],
    closeReason: {
      type: String,
      enum: CLOSE_REASONS,
    },
    closedAt: { type: Date },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

chatRoomSchema.index({ "participants.sessionId": 1 });
chatRoomSchema.index({ status: 1, createdAt: -1 });

export const ChatRoom = mongoose.model<IChatRoom>("ChatRoom", chatRoomSchema);
