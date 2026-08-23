import mongoose, { type Document, Schema, type Types } from "mongoose";

export interface IRateLimitEvent extends Document {
  _id: Types.ObjectId;
  sessionId?: Types.ObjectId;
  ipHash: string;
  eventType: string;
  count: number;
  windowStart: Date;
  createdAt: Date;
}

const rateLimitEventSchema = new Schema<IRateLimitEvent>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "AnonymousSession",
    },
    ipHash: {
      type: String,
      required: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      default: 1,
    },
    windowStart: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

rateLimitEventSchema.index({ ipHash: 1, eventType: 1, windowStart: 1 });
// Auto-expire after 24 hours
rateLimitEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export const RateLimitEvent = mongoose.model<IRateLimitEvent>(
  "RateLimitEvent",
  rateLimitEventSchema
);
