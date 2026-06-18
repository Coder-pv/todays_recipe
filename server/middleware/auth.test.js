import { describe, expect, it, vi } from "vitest";
import { createJwt } from "../utils/auth.js";
import { requireAuth } from "./auth.js";

function createResponseDouble() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe("requireAuth", () => {
  it("rejects requests without a bearer token", () => {
    const req = { headers: {} };
    const res = createResponseDouble();
    const next = vi.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches verified auth payloads", () => {
    const token = createJwt({ sub: "user-42" }, { secret: "test-secret" });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createResponseDouble();
    const next = vi.fn();
    const originalSecret = process.env.JWT_SECRET;

    process.env.JWT_SECRET = "test-secret";
    requireAuth(req, res, next);
    if (originalSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalSecret;
    }

    expect(req.auth.sub).toBe("user-42");
    expect(next).toHaveBeenCalled();
  });
});
