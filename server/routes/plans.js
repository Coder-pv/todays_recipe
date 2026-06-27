import { Router } from "express";
import { Profile } from "../models/Profile.js";
import { PantryItem } from "../models/PantryItem.js";
import { MealPlan } from "../models/MealPlan.js";
import { requireDb } from "../middleware/clientId.js";
import { requireAuth } from "../middleware/auth.js";
import { generateMealPlan, sanitizeMealPlanForPantry } from "../services/mealPlanAI.js";
import { applyPantryDeductions, normalizeName } from "../utils/pantryDeduct.js";

const router = Router();
router.use(requireDb, requireAuth);

const SLOTS = ["breakfast", "lunch", "snacks", "dinner", "mealOfTheDay"];

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function emptySlot() {
  return {
    title: "",
    description: "",
    calories: 0,
    ingredientsUsed: [],
    completed: false,
    deductedSnapshot: [],
  };
}

function applyAvailableSlots(plan, availableSlots) {
  const out = plan?.toObject ? plan.toObject() : { ...plan };
  out.availableSlots = availableSlots;
  for (const slot of SLOTS) {
    if (!availableSlots.includes(slot)) {
      out[slot] = emptySlot();
    }
  }
  return out;
}

function resolveSlots(profile) {
  const pattern = profile?.mealPattern;
  if (pattern === "breakfast_lunch_snacks_dinner") return ["breakfast", "lunch", "snacks", "dinner"];
  if (pattern === "lunch_dinner") return ["lunch", "dinner"];
  if (pattern === "meal_of_the_day") return ["mealOfTheDay"];
  return ["breakfast", "lunch", "dinner"];
}

router.get("/", async (req, res, next) => {
  try {
    const date = (req.query.date && String(req.query.date)) || todayKey();
    const profile = await Profile.findOne({ userId: req.auth.sub });
    const availableSlots = resolveSlots(profile);
    const pantryItems = await PantryItem.find({ userId: req.auth.sub }).lean();
    const plan = await MealPlan.findOne({ userId: req.auth.sub, date }).lean();
    if (!plan) {
      return res.json({
        date,
        servingPeople: profile?.defaultServingPeople || 2,
        breakfast: emptySlot(),
        lunch: emptySlot(),
        snacks: emptySlot(),
        dinner: emptySlot(),
        mealOfTheDay: emptySlot(),
        availableSlots,
        generatedAt: null,
        source: null,
      });
    }
    res.json(sanitizeMealPlanForPantry(applyAvailableSlots(plan, availableSlots), pantryItems));
  } catch (e) {
    next(e);
  }
});

async function runGenerate(req, date, servingPeople) {
  const profile = await Profile.findOne({ userId: req.auth.sub });
  if (!profile) {
    const error = new Error("Profile not found");
    error.status = 404;
    throw error;
  }
  const sp = Math.max(1, Number(servingPeople) || profile.defaultServingPeople || 2);
  const availableSlots = resolveSlots(profile);
  const pantryItems = await PantryItem.find({ userId: req.auth.sub }).lean();
  const { meals, source, fallbackReason } = await generateMealPlan({
    profile: profile.toObject ? profile.toObject() : profile,
    pantryItems,
    date,
    servingPeople: sp,
  });

  const setDoc = {
    userId: req.auth.sub,
    clientId: req.auth.sub,
    servingPeople: sp,
    breakfast: { ...(meals.breakfast || emptySlot()), completed: false, deductedSnapshot: [] },
    lunch: { ...(meals.lunch || emptySlot()), completed: false, deductedSnapshot: [] },
    snacks: { ...(meals.snacks || emptySlot()), completed: false, deductedSnapshot: [] },
    dinner: { ...(meals.dinner || emptySlot()), completed: false, deductedSnapshot: [] },
    mealOfTheDay: { ...(meals.mealOfTheDay || emptySlot()), completed: false, deductedSnapshot: [] },
    availableSlots,
    generatedAt: new Date(),
    source,
    fallbackReason: fallbackReason || "",
  };

  const plan = await MealPlan.findOneAndUpdate(
    { userId: req.auth.sub, date },
    { $set: setDoc },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return plan;
}

router.post("/generate", async (req, res, next) => {
  try {
    const date = (req.body?.date && String(req.body.date)) || todayKey();
    const servingPeople = req.body?.servingPeople;
    const plan = await runGenerate(req, date, servingPeople);
    res.json(plan);
  } catch (e) {
    next(e);
  }
});

router.post("/:date/refresh", async (req, res, next) => {
  try {
    const date = String(req.params.date);
    const servingPeople = req.body?.servingPeople;
    const plan = await runGenerate(req, date, servingPeople);
    res.json(plan);
  } catch (e) {
    next(e);
  }
});

router.patch("/:date/meal/:slot", async (req, res, next) => {
  try {
    const date = String(req.params.date);
    const slot = String(req.params.slot);
    if (!SLOTS.includes(slot)) {
      return res.status(400).json({ error: "Invalid meal slot" });
    }
    const completed = Boolean(req.body?.completed);

    const plan = await MealPlan.findOne({ userId: req.auth.sub, date });
    if (!plan) {
      return res.status(404).json({ error: "No meal plan for this date" });
    }

    const meal = plan[slot];
    if (!meal) return res.status(400).json({ error: "Invalid meal slot" });

    if (completed === true) {
      if (meal.completed) {
        const fresh = await MealPlan.findOne({ userId: req.auth.sub, date }).lean();
        return res.json(fresh);
      }
      const pantryDocs = await PantryItem.find({ userId: req.auth.sub });
      const { deducted, unmatched } = applyPantryDeductions(pantryDocs, meal.ingredientsUsed || []);
      for (const p of pantryDocs) {
        await p.save();
      }

      meal.completed = true;
      meal.deductedSnapshot = deducted.map((x) => ({ name: x.name, quantity: x.amount }));
      await plan.save();
      const fresh = await MealPlan.findOne({ userId: req.auth.sub, date }).lean();
      return res.json({ ...fresh, pantryUpdate: { deducted, unmatched } });
    }

    if (completed === false) {
      if (!meal.completed) {
        const fresh = await MealPlan.findOne({ userId: req.auth.sub, date }).lean();
        return res.json(fresh);
      }
      const snap = meal.deductedSnapshot || [];
      const all = await PantryItem.find({ userId: req.auth.sub });
      for (const row of snap) {
        const qty = Number(row.quantity) || 0;
        if (qty <= 0) continue;
        const item = all.find((p) => normalizeName(p.name) === normalizeName(row.name));
        if (item) {
          item.quantity += qty;
          await item.save();
        } else {
          await PantryItem.create({
            userId: req.auth.sub,
            clientId: req.auth.sub,
            name: row.name,
            quantity: qty,
            unit: "unit",
          });
        }
      }
      meal.completed = false;
      meal.deductedSnapshot = [];
      await plan.save();
      const fresh = await MealPlan.findOne({ userId: req.auth.sub, date }).lean();
      return res.json({ ...fresh, pantryRestored: true });
    }

    res.status(400).json({ error: "completed must be true or false" });
  } catch (e) {
    next(e);
  }
});

export default router;
