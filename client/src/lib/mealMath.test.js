import { describe, it, expect } from "vitest";
import { sumCompletedCalories } from "./mealMath.js";

describe("sumCompletedCalories", () => {
  it("returns 0 for null", () => {
    expect(sumCompletedCalories(null)).toBe(0);
  });

  it("sums completed slots", () => {
    const plan = {
      breakfast: { completed: true, calories: 300 },
      lunch: { completed: false, calories: 500 },
      dinner: { completed: true, calories: 400 },
    };
    expect(sumCompletedCalories(plan)).toBe(700);
  });
});
