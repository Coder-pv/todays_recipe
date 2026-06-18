import { Router } from "express";
import { Profile } from "../models/Profile.js";
import { requireDb } from "../middleware/clientId.js";
import { requireAuth } from "../middleware/auth.js";
import { hashPassword } from "../utils/auth.js";

const router = Router();
router.use(requireDb, requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const doc = await Profile.findOne({ userId: req.auth.sub });
    if (!doc) return res.status(404).json({ error: "Profile not found" });
    res.json(doc);
  } catch (e) {
    next(e);
  }
});

router.put("/", async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const allowed = [
      "username",
      "dietaryPreference",
      "allergies",
      "healthGoal",
      "dailyCalorieTarget",
      "mealsPerDay",
      "mealPattern",
      "mealDistribution",
      "defaultServingPeople",
    ];
    const update = {};
    for (const k of allowed) {
      if (b[k] !== undefined) update[k] = b[k];
    }
    if (update.username !== undefined) {
      update.username = String(update.username).trim();
      update.usernameLower = update.username.toLowerCase();
      const existing = await Profile.findOne({
        usernameLower: update.usernameLower,
        userId: { $ne: req.auth.sub },
      });
      if (existing) {
        return res.status(409).json({ error: "Username is already taken" });
      }
    }
    if (b.password !== undefined) {
      const raw = String(b.password).trim();
      if (raw) {
        update.passwordHash = hashPassword(raw);
      }
    }
    if (update.mealPattern !== undefined && update.mealsPerDay === undefined) {
      update.mealsPerDay = mealPatternToCount(update.mealPattern);
    }
    if (update.mealsPerDay !== undefined && update.mealPattern === undefined) {
      update.mealPattern = mealCountToPattern(update.mealsPerDay);
    }
    const doc = await Profile.findOneAndUpdate(
      { userId: req.auth.sub },
      { $set: update },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: "Profile not found" });
    res.json(doc);
  } catch (e) {
    next(e);
  }
});

function mealPatternToCount(mealPattern) {
  const map = {
    breakfast_lunch_snacks_dinner: 4,
    breakfast_lunch_dinner: 3,
    lunch_dinner: 2,
    meal_of_the_day: 1,
  };
  return map[mealPattern] ?? 3;
}

function mealCountToPattern(mealsPerDay) {
  const n = Number(mealsPerDay);
  if (n >= 4) return "breakfast_lunch_snacks_dinner";
  if (n === 2) return "lunch_dinner";
  if (n === 1) return "meal_of_the_day";
  return "breakfast_lunch_dinner";
}

export default router;
