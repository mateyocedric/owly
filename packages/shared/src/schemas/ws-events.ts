import { z } from "zod";
import { RATE_LIMITS } from "../constants.js";

// ─── Client → Server Events ─────────────────────────────────────────────────

export const queueJoinSchema = z.object({
  type: z.literal("queue.join"),
  data: z.object({
    interests: z.array(z.string().max(50)).max(5).optional(),
  }),
});

export const queueLeaveSchema = z.object({
  type: z.literal("queue.leave"),
});

export const chatMessageSchema = z.object({
  type: z.literal("chat.message"),
  data: z.object({
    content: z
      .string()
      .min(RATE_LIMITS.MIN_MESSAGE_LENGTH)
      .max(RATE_LIMITS.MAX_MESSAGE_LENGTH),
  }),
});

export const chatTypingSchema = z.object({
  type: z.literal("chat.typing"),
});

export const chatNextSchema = z.object({
  type: z.literal("chat.next"),
});

export const chatStopSchema = z.object({
  type: z.literal("chat.stop"),
});

export const chatReportSchema = z.object({
  type: z.literal("chat.report"),
  data: z.object({
    category: z.enum([
      "spam",
      "scam",
      "sexual_exploitation",
      "threats",
      "hate_speech",
      "doxxing",
      "personal_info_request",
      "harassment",
      "underage",
      "other",
    ]),
    description: z.string().max(500).optional(),
  }),
});

export const chatBlockSchema = z.object({
  type: z.literal("chat.block"),
});

const iceCandidateSchema = z
  .object({
    candidate: z.string().optional(),
    sdpMid: z.string().nullable().optional(),
    sdpMLineIndex: z.number().int().nullable().optional(),
    usernameFragment: z.string().nullable().optional(),
  })
  .passthrough();

export const webrtcSignalSchema = z.object({
  type: z.literal("webrtc.signal"),
  data: z.object({
    kind: z.enum(["offer", "answer", "ice"]),
    sdp: z.string().optional(),
    candidate: iceCandidateSchema.nullable().optional(),
  }),
});

export const videoStateSchema = z.object({
  type: z.literal("video.state"),
  data: z.object({
    cameraOn: z.boolean(),
    micOn: z.boolean(),
  }),
});

export const pingSchema = z.object({
  type: z.literal("ping"),
});

/** Union of all client → server events */
export const clientEventSchema = z.discriminatedUnion("type", [
  queueJoinSchema,
  queueLeaveSchema,
  chatMessageSchema,
  chatTypingSchema,
  chatNextSchema,
  chatStopSchema,
  chatReportSchema,
  chatBlockSchema,
  webrtcSignalSchema,
  videoStateSchema,
  pingSchema,
]);

export type ClientEvent = z.infer<typeof clientEventSchema>;

// ─── Server → Client Events ─────────────────────────────────────────────────

export const serverQueueWaitingSchema = z.object({
  type: z.literal("queue.waiting"),
  data: z.object({
    position: z.number().int().optional(),
  }),
});

export const serverMatchFoundSchema = z.object({
  type: z.literal("match.found"),
  data: z.object({
    roomId: z.string(),
    commonInterests: z.array(z.string()).optional(),
    initiator: z.boolean(),
  }),
});

export const serverWebrtcSignalSchema = z.object({
  type: z.literal("webrtc.signal"),
  data: z.object({
    kind: z.enum(["offer", "answer", "ice"]),
    sdp: z.string().optional(),
    candidate: iceCandidateSchema.nullable().optional(),
  }),
});

export const serverVideoStateSchema = z.object({
  type: z.literal("video.state"),
  data: z.object({
    cameraOn: z.boolean(),
    micOn: z.boolean(),
  }),
});

export const serverChatMessageSchema = z.object({
  type: z.literal("chat.message"),
  data: z.object({
    content: z.string(),
    timestamp: z.string().datetime(),
  }),
});

export const serverChatTypingSchema = z.object({
  type: z.literal("chat.typing"),
});

export const serverPartnerLeftSchema = z.object({
  type: z.literal("chat.partner_left"),
  data: z.object({
    reason: z.enum(["next", "stop", "disconnect", "report", "moderation"]),
  }),
});

export const serverChatEndedSchema = z.object({
  type: z.literal("chat.ended"),
  data: z.object({
    reason: z.enum(["next", "stop", "report", "moderation", "error", "timeout"]),
  }),
});

export const serverModerationWarningSchema = z.object({
  type: z.literal("moderation.warning"),
  data: z.object({
    message: z.string(),
  }),
});

export const serverErrorSchema = z.object({
  type: z.literal("error"),
  data: z.object({
    code: z.string(),
    message: z.string(),
    retryAfterSeconds: z.number().int().nonnegative().optional(),
  }),
});

export const serverPongSchema = z.object({
  type: z.literal("pong"),
});

/** Union of all server → client events */
export const serverEventSchema = z.discriminatedUnion("type", [
  serverQueueWaitingSchema,
  serverMatchFoundSchema,
  serverChatMessageSchema,
  serverChatTypingSchema,
  serverPartnerLeftSchema,
  serverChatEndedSchema,
  serverModerationWarningSchema,
  serverWebrtcSignalSchema,
  serverVideoStateSchema,
  serverErrorSchema,
  serverPongSchema,
]);

export type ServerEvent = z.infer<typeof serverEventSchema>;
