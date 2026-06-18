import mongoose from "mongoose";
import { MealPlan } from "../models/MealPlan.js";
import { PantryItem } from "../models/PantryItem.js";
import { Profile } from "../models/Profile.js";

async function backfillLegacyClientIds() {
  const filter = {
    userId: { $exists: true, $ne: null },
    $or: [{ clientId: null }, { clientId: { $exists: false } }],
  };
  const update = [{ $set: { clientId: "$userId" } }];

  await Promise.all([
    Profile.updateMany(filter, update),
    PantryItem.updateMany(filter, update),
    MealPlan.updateMany(filter, update),
  ]);
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("[db] MONGODB_URI not set — skipping MongoDB (optional for template).");
    return false;
  }
  try {
    await mongoose.connect(uri);
    await backfillLegacyClientIds();
    console.log("[db] MongoDB connected");
    return true;
  } catch (err) {
    console.error("[db] MongoDB connection failed:", err.message);
    return false;
  }
}
