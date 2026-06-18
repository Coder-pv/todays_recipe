import { Router } from "express";
import authRouter from "./auth.js";
import genaiRouter from "./genai.js";
import profileRouter from "./profile.js";
import pantryRouter from "./pantry.js";
import plansRouter from "./plans.js";
import dashboardRouter from "./dashboard.js";
import highlightsRouter from "./highlights.js";

const router = Router();

router.get("/ping", (_req, res) => {
  res.json({ ok: true, message: "API is up" });
});

router.use("/auth", authRouter);
router.use("/genai", genaiRouter);
router.use("/profile", profileRouter);
router.use("/pantry", pantryRouter);
router.use("/plans", plansRouter);
router.use("/dashboard", dashboardRouter);
router.use("/highlights", highlightsRouter);

export default router;
