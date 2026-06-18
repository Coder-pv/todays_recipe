import { buildStubMealPlan } from "../utils/mealPlanStub.js";

/**
 * @param {object} input
 * @param {object} input.profile
 * @param {object[]} input.pantryItems
 * @param {string} input.date
 * @param {number} input.servingPeople
 * @returns {Promise<{ meals: object, source: 'openrouter' | 'openai' | 'stub', fallbackReason?: string }>}
 */
export async function generateMealPlan(input) {
  const provider = resolveProvider();
  if (!provider) {
    const meals = buildStubMealPlan(input);
    return { meals, source: "stub", fallbackReason: "No LLM API key is configured." };
  }

  const availableSlots = resolveSlots(input.profile);
  const allergies = Array.isArray(input.profile?.allergies)
    ? input.profile.allergies.filter(Boolean)
    : [];

  const userPayload = {
    profile: {
      dietaryPreference: input.profile?.dietaryPreference,
      allergies,
      healthGoal: input.profile?.healthGoal,
      dailyCalorieTarget: input.profile?.dailyCalorieTarget,
      mealsPerDay: input.profile?.mealsPerDay,
      mealPattern: input.profile?.mealPattern,
      mealDistribution: input.profile?.mealDistribution,
      defaultServingPeople: input.profile?.defaultServingPeople,
    },
    pantryItems: (input.pantryItems || []).map((p) => ({
      name: p.name,
      quantity: p.quantity,
      unit: p.unit,
      imageUrl: p.imageUrl || "",
    })),
    date: input.date,
    servingPeople: input.servingPeople,
    availableSlots,
    rules: {
      excludeAllergies: true,
      includeCalorieTarget: true,
      includeMealCount: true,
      includeWeightPreference: true,
      includeServingPeople: true,
    },
  };

  const system = `You are a meal planning assistant. Respond with ONLY valid JSON (no markdown) matching this shape:
{"availableSlots":["breakfast|lunch|snacks|dinner|mealOfTheDay"],"breakfast":{"title":"string","description":"string","calories":number,"recipeIngredients":[{"name":"string","quantity":"string","unit":"string"}],"steps":["string"],"ingredientsUsed":[{"name":"string","quantity":number}]},"lunch":{"title":"string","description":"string","calories":number,"recipeIngredients":[{"name":"string","quantity":"string","unit":"string"}],"steps":["string"],"ingredientsUsed":[{"name":"string","quantity":number}]},"snacks":{"title":"string","description":"string","calories":number,"recipeIngredients":[{"name":"string","quantity":"string","unit":"string"}],"steps":["string"],"ingredientsUsed":[{"name":"string","quantity":number}]},"dinner":{"title":"string","description":"string","calories":number,"recipeIngredients":[{"name":"string","quantity":"string","unit":"string"}],"steps":["string"],"ingredientsUsed":[{"name":"string","quantity":number}]},"mealOfTheDay":{"title":"string","description":"string","calories":number,"recipeIngredients":[{"name":"string","quantity":"string","unit":"string"}],"steps":["string"],"ingredientsUsed":[{"name":"string","quantity":number}]}}
Rules:
1) Use ONLY slots listed in availableSlots from user payload for real meals; keep other slots empty.
2) Completely exclude allergy ingredients.
3) Mention calorie target, meals per day, health goal, and servingPeople in descriptions naturally.
4) recipeIngredients must contain the complete ingredient list for the recipe with clear amounts and units.
5) steps must contain 5 to 8 practical, ordered cooking instructions.
6) Quantities in ingredientsUsed are pantry amounts to consume.
7) Calories are integers per person for each meal.`;

  try {
    const r = await fetch(provider.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        "Content-Type": "application/json",
        ...provider.extraHeaders,
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: JSON.stringify(userPayload) },
        ],
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      const detail = `LLM provider ${provider.name} failed with status ${r.status}.`;
      console.warn(`${detail} Using stub instead.`, errText);
      const meals = buildStubMealPlan(input);
      return { meals, source: "stub", fallbackReason: detail };
    }

    const data = await r.json();
    const rawContent = data.choices?.[0]?.message?.content;
    const text = normalizeContent(rawContent);
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const meals = buildStubMealPlan(input);
      return { meals, source: "stub", fallbackReason: `LLM provider ${provider.name} returned invalid JSON.` };
    }

    const meals = normalizeAiMeals(parsed, input, availableSlots);
    return { meals, source: provider.name };
  } catch (error) {
    const detail = `LLM provider ${provider.name} request failed.`;
    console.warn(`${detail} Using stub instead.`, error?.message || error);
    const meals = buildStubMealPlan(input);
    return { meals, source: "stub", fallbackReason: detail };
  }
}

function resolveProvider() {
  if (process.env.OPENROUTER_API_KEY) {
    return {
      name: "openrouter",
      apiKey: process.env.OPENROUTER_API_KEY,
      endpoint: process.env.OPENROUTER_API_URL || "https://openrouter.ai/api/v1/chat/completions",
      model: process.env.OPENROUTER_MODEL || "nex-agi/nex-n2-pro:free",
      extraHeaders: {
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:5173",
        "X-Title": process.env.OPENROUTER_APP_NAME || "todays-recipe",
      },
    };
  }

  if (process.env.OPENAI_API_KEY) {
    return {
      name: "openai",
      apiKey: process.env.OPENAI_API_KEY,
      endpoint: process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions",
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      extraHeaders: {},
    };
  }

  return null;
}

function normalizeAiMeals(parsed, input, availableSlots) {
  const slots = ["breakfast", "lunch", "snacks", "dinner", "mealOfTheDay"];
  const fallback = buildStubMealPlan(input);
  const out = { availableSlots };
  for (const slot of slots) {
    const m = parsed?.[slot];
    if (!availableSlots.includes(slot)) {
      out[slot] = fallback[slot];
      continue;
    }
    if (!m || typeof m !== "object") {
      out[slot] = fallback[slot];
      continue;
    }
    out[slot] = {
      title: String(m.title || fallback[slot].title),
      description: String(m.description || fallback[slot].description),
      calories: Math.max(0, Math.round(Number(m.calories) || fallback[slot].calories)),
      recipeIngredients: normalizeRecipeIngredients(m.recipeIngredients, fallback[slot].recipeIngredients),
      steps: normalizeSteps(m.steps, fallback[slot].steps),
      ingredientsUsed: Array.isArray(m.ingredientsUsed)
        ? m.ingredientsUsed
            .filter((x) => x && x.name)
            .map((x) => ({
              name: String(x.name),
              quantity: Math.max(0, Number(x.quantity) || 0),
            }))
        : fallback[slot].ingredientsUsed,
    };
  }
  return out;
}

function normalizeRecipeIngredients(value, fallback = []) {
  if (!Array.isArray(value)) return fallback || [];
  const normalized = value
    .filter((x) => x && x.name)
    .map((x) => ({
      name: String(x.name),
      quantity: x.quantity === undefined || x.quantity === null ? "" : String(x.quantity),
      unit: x.unit === undefined || x.unit === null ? "" : String(x.unit),
    }));
  return normalized.length ? normalized : fallback || [];
}

function normalizeSteps(value, fallback = []) {
  if (!Array.isArray(value)) return fallback || [];
  const normalized = value.map((step) => String(step || "").trim()).filter(Boolean);
  return normalized.length ? normalized : fallback || [];
}

function resolveSlots(profile) {
  const pattern = profile?.mealPattern;
  if (pattern === "breakfast_lunch_snacks_dinner") return ["breakfast", "lunch", "snacks", "dinner"];
  if (pattern === "lunch_dinner") return ["lunch", "dinner"];
  if (pattern === "meal_of_the_day") return ["mealOfTheDay"];
  return ["breakfast", "lunch", "dinner"];
}

function normalizeContent(content) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part.text === "string") return part.text;
        return "";
      })
      .join("")
      .trim();
  }
  return "{}";
}
