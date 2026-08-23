import mongoose, { type Document, Schema, type Types } from "mongoose";

export const SESSION_STATUSES = [
  "active",
  "warned",
  "temporarily_banned",
  "permanently_banned",
] as const;

export type SessionStatus = (typeof SESSION_STATUSES)[number];

export interface IAnonymousSession extends Document {
  _id: Types.ObjectId;
  tokenHash: string;
  status: SessionStatus;
  ipHash: string;
  userAgent?: string;
  interests: string[];
  createdAt: Date;
  lastActiveAt: Date;
  expiresAt: Date;
}

const anonymousSessionSchema = new Schema<IAnonymousSession>(
  {
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: SESSION_STATUSES,
      default: "active",
      required: true,
    },
    ipHash: {
      type: String,
      required: true,
      index: true,
    },
    userAgent: { type: String },
    interests: [{ type: String }],
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// TTL index to auto-expire sessions
anonymousSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AnonymousSession = mongoose.model<IAnonymousSession>(
  "AnonymousSession",
  anonymousSessionSchema
);
