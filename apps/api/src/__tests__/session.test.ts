import { describe, it, expect } from "vitest";
import { generateSessionToken, hashToken, hashIP } from "../lib/token.js";

describe("Cryptographic Token & Privacy Utilities", () => {
  it("generates 64-character hex tokens", () => {
    const token = generateSessionToken();
    expect(token).toHaveLength(64);
  });

  it("deterministically hashes tokens with HMAC", () => {
    const token = "test_raw_session_token_12345";
    const hash1 = hashToken(token);
    const hash2 = hashToken(token);

    expect(hash1).toEqual(hash2);
    expect(hash1).not.toEqual(token);
  });

  it("deterministically hashes IP addresses without exposing raw value", () => {
    const ip = "192.168.1.50";
    const hash = hashIP(ip);

    expect(hash).toHaveLength(64);
    expect(hash).not.toContain(ip);
  });
});
