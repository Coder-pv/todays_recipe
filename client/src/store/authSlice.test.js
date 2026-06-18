import { describe, expect, it } from "vitest";
import { authInitialState, authReducer } from "./authSlice.js";

describe("authReducer", () => {
  it("restores a signed-in session", () => {
    const next = authReducer(authInitialState, {
      type: "auth/sessionRestored",
      payload: {
        token: "jwt-token",
        user: { username: "chef" },
      },
    });

    expect(next.status).toBe("authenticated");
    expect(next.token).toBe("jwt-token");
    expect(next.user.username).toBe("chef");
  });

  it("stores request failures", () => {
    const next = authReducer(authInitialState, {
      type: "auth/requestFailed",
      payload: "Nope",
    });

    expect(next.status).toBe("anonymous");
    expect(next.error).toBe("Nope");
  });
});
