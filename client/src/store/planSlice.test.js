import { describe, expect, it } from "vitest";
import { planInitialState, planReducer } from "./planSlice.js";

describe("planReducer", () => {
  it("stores generated plans", () => {
    const next = planReducer(planInitialState, {
      type: "plan/loadSucceeded",
      payload: {
        date: "2026-04-18",
        breakfast: { title: "Oats" },
      },
    });

    expect(next.status).toBe("succeeded");
    expect(next.data.breakfast.title).toBe("Oats");
  });

  it("stores informational notes separately from plan data", () => {
    const next = planReducer(planInitialState, {
      type: "plan/noteUpdated",
      payload: "Meal marked complete.",
    });

    expect(next.note).toBe("Meal marked complete.");
    expect(next.data).toBeNull();
  });
});
