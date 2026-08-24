import { describe, it, expect } from "vitest";
import {
  clientEventSchema,
  serverEventSchema,
  MATCHMAKING,
} from "@owly/shared";
import {
  normalizeInterest,
  shouldJoinGeneralQueue,
} from "../matchmaking/policy.js";

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

  it("validates client queue.join event with gender", () => {
    const event = {
      type: "queue.join",
      data: {
        interests: ["gaming"],
        gender: "female",
      },
    };

    const parsed = clientEventSchema.safeParse(event);
    expect(parsed.success).toBe(true);
  });

  it("rejects client queue.join with an invalid gender", () => {
    const event = {
      type: "queue.join",
      data: {
        gender: "prefer_not_to_say",
      },
    };

    const parsed = clientEventSchema.safeParse(event);
    expect(parsed.success).toBe(false);
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

  it("validates server match.found event with partnerGender", () => {
    const event = {
      type: "match.found",
      data: {
        roomId: "room_12345",
        commonInterests: ["coding"],
        initiator: false,
        partnerGender: "other",
      },
    };

    const parsed = serverEventSchema.safeParse(event);
    expect(parsed.success).toBe(true);
  });
});

describe("Interest queue policy", () => {
  it("normalizes interest slugs", () => {
    expect(normalizeInterest("  Gaming ")).toBe("gaming");
    expect(normalizeInterest("")).toBe("");
  });

  it("sends users without topics to the general queue immediately", () => {
    expect(shouldJoinGeneralQueue([], Date.now(), MATCHMAKING.INTEREST_TIMEOUT_SECONDS)).toBe(
      true
    );
  });

  it("keeps topic-queued users out of the general queue until the timeout", () => {
    const queuedAt = 1_000;
    const timeout = MATCHMAKING.INTEREST_TIMEOUT_SECONDS;

    expect(
      shouldJoinGeneralQueue(["music"], queuedAt, timeout, queuedAt + 5_000)
    ).toBe(false);
    expect(
      shouldJoinGeneralQueue(
        ["music"],
        queuedAt,
        timeout,
        queuedAt + timeout * 1000
      )
    ).toBe(true);
  });
});
