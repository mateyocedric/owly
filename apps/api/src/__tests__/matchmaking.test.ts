import { describe, it, expect, vi } from "vitest";
import {
  clientEventSchema,
  serverEventSchema,
  RATE_LIMITS,
} from "@owly/shared";

describe("WebSocket Event Contracts", () => {
  it("validates client queue.join event with valid interests", () => {
    const event = {
      type: "queue.join",
      data: {
        interests: ["gaming", "music"],
      },
    };

    const parsed = clientEventSchema.safeParse(event);
    expect(parsed.success).toBe(true);
  });

  it("rejects client queue.join with more than 5 interests", () => {
    const event = {
      type: "queue.join",
      data: {
        interests: ["1", "2", "3", "4", "5", "6"],
      },
    };

    const parsed = clientEventSchema.safeParse(event);
    expect(parsed.success).toBe(false);
  });

  it("validates client chat.message event within character limits", () => {
    const event = {
      type: "chat.message",
      data: {
        content: "Hello stranger!",
      },
    };

    const parsed = clientEventSchema.safeParse(event);
    expect(parsed.success).toBe(true);
  });

  it("rejects empty chat messages", () => {
    const event = {
      type: "chat.message",
      data: {
        content: "",
      },
    };

    const parsed = clientEventSchema.safeParse(event);
    expect(parsed.success).toBe(false);
  });

  it("validates server match.found event", () => {
    const event = {
      type: "match.found",
      data: {
        roomId: "room_12345",
        commonInterests: ["coding"],
        initiator: true,
      },
    };

    const parsed = serverEventSchema.safeParse(event);
    expect(parsed.success).toBe(true);
  });
});
