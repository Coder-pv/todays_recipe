import { Router } from "express";
import { PantryItem } from "../models/PantryItem.js";
import { requireDb } from "../middleware/clientId.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireDb, requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const items = await PantryItem.find({ userId: req.auth.sub }).sort({ name: 1 }).lean();
    res.json({ items });
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, quantity, unit, imageUrl } = req.body ?? {};
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "name is required" });
    }
    const q = Number(quantity);
    if (Number.isNaN(q) || q < 0) {
      return res.status(400).json({ error: "quantity must be a non-negative number" });
    }
    const doc = await PantryItem.create({
      userId: req.auth.sub,
      clientId: req.auth.sub,
      name: name.trim(),
      quantity: q,
      unit: (unit && String(unit).trim()) || "unit",
      imageUrl: imageUrl ? String(imageUrl).trim() : "",
    });
    res.status(201).json(doc);
  } catch (e) {
    next(e);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const { name, quantity, unit, imageUrl } = req.body ?? {};
    const update = {};
    if (name !== undefined) update.name = String(name).trim();
    if (quantity !== undefined) {
      const q = Number(quantity);
      if (Number.isNaN(q) || q < 0) {
        return res.status(400).json({ error: "quantity must be a non-negative number" });
      }
      update.quantity = q;
    }
    if (unit !== undefined) update.unit = String(unit).trim();
    if (imageUrl !== undefined) update.imageUrl = String(imageUrl).trim();

    const doc = await PantryItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.auth.sub },
      { $set: update },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const r = await PantryItem.deleteOne({ _id: req.params.id, userId: req.auth.sub });
    if (r.deletedCount === 0) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

export default router;
