import { Router } from "express";
import { Profile } from "../models/Profile.js";
import { PantryItem } from "../models/PantryItem.js";
import { MealPlan } from "../models/MealPlan.js";
import { requireDb } from "../middleware/clientId.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireDb, requireAuth);

const SLOTS = ["breakfast", "lunch", "dinner"];

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDaysYmd(ymd, delta) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function consumedFromPlan(plan) {
  if (!plan) return 0;
  let sum = 0;
  for (const s of SLOTS) {
    const m = plan[s];
    if (m?.completed) sum += Number(m.calories) || 0;
  }
  return sum;
}

router.get("/", async (req, res, next) => {
  try {
    const date = (req.query.date && String(req.query.date)) || todayKey();
    const profile = await Profile.findOne({ userId: req.auth.sub });
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    const target = Number(profile.dailyCalorieTarget) || 2000;
    const plan = await MealPlan.findOne({ userId: req.auth.sub, date }).lean();
    const consumed = consumedFromPlan(plan);
    const remaining = Math.max(0, target - consumed);

    const pantryItems = await PantryItem.find({ userId: req.auth.sub }).lean();
    const pantryTotalQty = pantryItems.reduce((a, p) => a + (Number(p.quantity) || 0), 0);
    const pantryOverview = {
      itemCount: pantryItems.length,
      totalQuantity: Math.round(pantryTotalQty * 100) / 100,
      items: pantryItems.slice(0, 12),
    };

    const weekDates = [];
    for (let i = 6; i >= 0; i--) {
      weekDates.push(addDaysYmd(date, -i));
    }
    const weekPlans = await MealPlan.find({
      userId: req.auth.sub,
      date: { $in: weekDates },
    }).lean();

    const byDate = Object.fromEntries(weekPlans.map((p) => [p.date, p]));
    const weeklyCalories = weekDates.map((d) => ({
      date: d,
      consumed: consumedFromPlan(byDate[d]),
    }));

    res.json({
      date,
      dailyCalorieTarget: target,
      consumedCalories: consumed,
      remainingCalories: remaining,
      mealPlan: plan || null,
      pantryOverview,
      weeklyCalories,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
