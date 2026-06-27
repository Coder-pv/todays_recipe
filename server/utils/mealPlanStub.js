/**
 * Deterministic stub meal plan when OpenAI is not configured.
 * @param {object} ctx
 * @param {object} ctx.profile
 * @param {{ name: string, quantity: number, unit?: string }[]} ctx.pantryItems
 * @param {string} ctx.date
 * @param {number} ctx.servingPeople
 */
export function buildStubMealPlan({ profile, pantryItems, date, servingPeople }) {
  const n = Math.max(1, servingPeople || 1);
  const top = (pantryItems || []).slice(0, 3).map((p) => p.name);
  const pantryHint = top.length ? top.join(", ") : "pantry staples";
  const titleBase = top.length ? top.join(" and ") : "Pantry";

  const pref = profile?.dietaryPreference || "vegetarian";
  const dist = profile?.mealDistribution || "balanced";

  let bCal = 420;
  let lCal = 550;
  let dCal = 480;
  if (dist === "heavy_breakfast") {
    bCal = 600;
    lCal = 500;
    dCal = 400;
  } else if (dist === "light_dinner") {
    bCal = 400;
    lCal = 520;
    dCal = 380;
  }

  const allergies = (profile?.allergies || []).filter(Boolean).join(", ") || "none listed";

  const breakfast = {
    title: `${titleBase} breakfast`,
    description: `Quick ${pref} breakfast using ${pantryHint}. Date ${date}. Serves ~${n}. Avoid: ${allergies}.`,
    calories: Math.round(bCal * (0.85 + n * 0.05)),
    recipeIngredients: buildRecipeIngredients("breakfast", n, pantryItems),
    steps: buildRecipeSteps("breakfast", n),
    ingredientsUsed: stubIngredientsFromPantry(pantryItems, "breakfast", n),
  };

  const lunch = {
    title: `${titleBase} lunch`,
    description: `Lunch aligned with ${profile?.healthGoal || "maintenance"} goal using only pantry items: ${pantryHint}.`,
    calories: Math.round(lCal * (0.85 + n * 0.05)),
    recipeIngredients: buildRecipeIngredients("lunch", n, pantryItems),
    steps: buildRecipeSteps("lunch", n),
    ingredientsUsed: stubIngredientsFromPantry(pantryItems, "lunch", n),
  };

  const dinner = {
    title: `${titleBase} dinner`,
    description: `Dinner for ${n} using only pantry items: ${pantryHint}. Distribution: ${dist}.`,
    calories: Math.round(dCal * (0.85 + n * 0.05)),
    recipeIngredients: buildRecipeIngredients("dinner", n, pantryItems),
    steps: buildRecipeSteps("dinner", n),
    ingredientsUsed: stubIngredientsFromPantry(pantryItems, "dinner", n),
  };

  const snacks = {
    title: `${titleBase} snack`,
    description: `Snack aligned with ${profile?.healthGoal || "maintenance"} goal using only pantry items: ${pantryHint}.`,
    calories: Math.round(220 * (0.85 + n * 0.05)),
    recipeIngredients: buildRecipeIngredients("snacks", n, pantryItems),
    steps: buildRecipeSteps("snacks", n),
    ingredientsUsed: stubIngredientsFromPantry(pantryItems, "snacks", n),
  };

  const mealOfTheDay = {
    title: `${titleBase} meal of the day`,
    description: `Single main meal for ${n} people using only pantry items: ${pantryHint}. Avoid: ${allergies}.`,
    calories: Math.round((bCal + lCal + dCal) * 0.9),
    recipeIngredients: buildRecipeIngredients("mealOfTheDay", n, pantryItems),
    steps: buildRecipeSteps("mealOfTheDay", n),
    ingredientsUsed: stubIngredientsFromPantry(pantryItems, "mealOfTheDay", n),
  };

  const availableSlots = resolveSlots(profile);
  const meals = {
    breakfast: emptySlotForDisabled("Breakfast not selected in profile."),
    lunch: emptySlotForDisabled("Lunch not selected in profile."),
    snacks: emptySlotForDisabled("Snacks not selected in profile."),
    dinner: emptySlotForDisabled("Dinner not selected in profile."),
    mealOfTheDay: emptySlotForDisabled("Meal of the day selected."),
    availableSlots,
  };
  if (availableSlots.includes("breakfast")) meals.breakfast = breakfast;
  if (availableSlots.includes("lunch")) meals.lunch = lunch;
  if (availableSlots.includes("snacks")) meals.snacks = snacks;
  if (availableSlots.includes("dinner")) meals.dinner = dinner;
  if (availableSlots.includes("mealOfTheDay")) meals.mealOfTheDay = mealOfTheDay;
  return meals;
}

function buildRecipeIngredients(slot, servingPeople, pantryItems) {
  const n = Math.max(1, servingPeople);
  return stubIngredientsFromPantry(pantryItems, slot, n).map((item) => ({
    name: item.name,
    quantity: String(item.quantity),
    unit: "unit",
  }));
}

function buildRecipeSteps(slot, servingPeople) {
  const n = Math.max(1, servingPeople);
  if (slot === "breakfast") {
    return [
      "Combine the grains or pantry base with yogurt or milk in a bowl.",
      "Fold in fruit, cinnamon, and any nuts or seeds.",
      "Rest for 5 minutes for a quick bowl, or chill overnight for a softer texture.",
      `Divide into ${n} serving${n === 1 ? "" : "s"} and add a light drizzle of honey if desired.`,
    ];
  }
  if (slot === "snacks") {
    return [
      "Slice the fruit or prep the pantry snack base.",
      "Pair it with nuts, yogurt, or another protein-rich ingredient.",
      "Season lightly with cinnamon, lemon, or salt depending on the ingredients.",
      `Serve immediately as ${n} portion${n === 1 ? "" : "s"}.`,
    ];
  }
  return [
    "Rinse and prep all vegetables, grains, and pantry ingredients.",
    "Warm oil in a pan, then saute aromatics for 2 to 3 minutes.",
    "Add the main pantry ingredients and cook until tender, stirring occasionally.",
    "Season to taste, adjust texture with water or broth, and simmer until balanced.",
    `Plate into ${n} serving${n === 1 ? "" : "s"} and finish with herbs or lemon.`,
  ];
}

function stubIngredientsFromPantry(pantryItems, _slot, servingPeople) {
  const n = Math.max(1, servingPeople);
  const items = (pantryItems || []).filter((p) => p.quantity > 0);
  if (!items.length) {
    return [
      { name: "rice", quantity: 0.5 * n },
      { name: "vegetables", quantity: 1 * n },
    ];
  }
  return items.slice(0, 4).map((p) => ({
    name: p.name,
    quantity: Math.min(p.quantity, Math.max(0.25, 0.5 * n)),
  }));
}

function resolveSlots(profile) {
  const pattern = profile?.mealPattern;
  if (pattern === "breakfast_lunch_snacks_dinner") return ["breakfast", "lunch", "snacks", "dinner"];
  if (pattern === "lunch_dinner") return ["lunch", "dinner"];
  if (pattern === "meal_of_the_day") return ["mealOfTheDay"];
  return ["breakfast", "lunch", "dinner"];
}

function emptySlotForDisabled(message) {
  return {
    title: "",
    description: message,
    calories: 0,
    recipeIngredients: [],
    steps: [],
    ingredientsUsed: [],
  };
}
