import { Router } from "express";
import { MealPlan } from "../models/MealPlan.js";
import { POPULAR_RECIPES } from "../data/popularRecipes.js";
import { requireDb } from "../middleware/clientId.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireDb, requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const recent = await MealPlan.find({
      userId: req.auth.sub,
      generatedAt: { $exists: true, $ne: null },
    })
      .sort({ generatedAt: -1 })
      .limit(6)
      .lean();

    const newlyGenerated = recent.map((p) => ({
      id: String(p._id),
      date: p.date,
      title: p.breakfast?.title || "Generated plan",
      blurb: `Plan for ${p.date} · ${p.source === "openai" ? "AI" : "Template"}`,
      tag: "New",
    }));

    res.json({
      popular: POPULAR_RECIPES,
      newlyGenerated,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
