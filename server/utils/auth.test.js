import { describe, expect, it } from "vitest";
import { createJwt, hashPassword, verifyJwt, verifyPassword } from "./auth.js";

describe("auth utils", () => {
  it("hashes and verifies passwords", () => {
    const hash = hashPassword("secret-123");

    expect(hash).not.toBe("secret-123");
    expect(verifyPassword("secret-123", hash)).toBe(true);
    expect(verifyPassword("wrong", hash)).toBe(false);
  });

  it("signs and verifies JWT payloads", () => {
    const token = createJwt({ sub: "user-1", username: "chef" }, { secret: "test-secret" });
    const payload = verifyJwt(token, { secret: "test-secret" });

    expect(payload.sub).toBe("user-1");
    expect(payload.username).toBe("chef");
    expect(payload.exp).toBeGreaterThan(payload.iat);
  });
});
