import { describe, expect, it } from "vitest";
import { mapProfileToForm, profileInitialState, profileReducer } from "./profileSlice.js";

describe("profileReducer", () => {
  it("maps API data into editable form state", () => {
    const form = mapProfileToForm({
      username: "alex",
      dietaryPreference: "vegan",
      allergies: ["peanut", "soy"],
      healthGoal: "maintenance",
      dailyCalorieTarget: 1800,
      mealsPerDay: 3,
      mealPattern: "breakfast_lunch_dinner",
      mealDistribution: "balanced",
      defaultServingPeople: 4,
    });

    expect(form.allergiesText).toBe("peanut, soy");
    expect(form.defaultServingPeople).toBe(4);
  });

  it("updates a single form field without clearing the rest", () => {
    const next = profileReducer(profileInitialState, {
      type: "profile/formUpdated",
      payload: { username: "chef" },
    });

    expect(next.form.username).toBe("chef");
    expect(next.form.healthGoal).toBe("maintenance");
  });
});
