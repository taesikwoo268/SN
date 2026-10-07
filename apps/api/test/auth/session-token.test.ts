import { describe, expect, it } from "bun:test";

import {
  generateSessionToken,
  hashSessionToken,
} from "../../src/modules/auth/session-token.ts";

describe("session token utilities", () => {
  it("generates unique URL-safe tokens", () => {
    const firstToken = generateSessionToken();
    const secondToken = generateSessionToken();

    expect(firstToken).not.toBe(secondToken);
    expect(firstToken).toMatch(
      /^[A-Za-z0-9_-]{43}$/,
    );
    expect(secondToken).toMatch(
      /^[A-Za-z0-9_-]{43}$/,
    );
  });

  it("hashes a token deterministically", () => {
    const token = generateSessionToken();

    const firstHash = hashSessionToken(token);
    const secondHash = hashSessionToken(token);

    expect(firstHash).toBe(secondHash);
    expect(firstHash).toMatch(
      /^[a-f0-9]{64}$/,
    );

    expect(firstHash).not.toBe(token);
  });
});