import mongoose from "mongoose";

const ingredientUsedSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, default: 1, min: 0 },
  },
  { _id: false }
);

const recipeIngredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: String, default: "" },
    unit: { type: String, default: "" },
  },
  { _id: false }
);

const deductedSnapshotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, default: 0 },
  },
  { _id: false }
);

const mealSlotSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    calories: { type: Number, default: 0, min: 0 },
    recipeIngredients: { type: [recipeIngredientSchema], default: [] },
    steps: { type: [String], default: [] },
    ingredientsUsed: { type: [ingredientUsedSchema], default: [] },
    completed: { type: Boolean, default: false },
    deductedSnapshot: { type: [deductedSnapshotSchema], default: [] },
  },
  { _id: false }
);

const mealPlanSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    clientId: { type: String, sparse: true },
    date: { type: String, required: true },
    servingPeople: { type: Number, default: 2, min: 1 },
    breakfast: { type: mealSlotSchema, default: () => ({}) },
    lunch: { type: mealSlotSchema, default: () => ({}) },
    snacks: { type: mealSlotSchema, default: () => ({}) },
    dinner: { type: mealSlotSchema, default: () => ({}) },
    mealOfTheDay: { type: mealSlotSchema, default: () => ({}) },
    availableSlots: { type: [String], default: ["breakfast", "lunch", "dinner"] },
    generatedAt: { type: Date },
    source: { type: String, enum: ["openrouter", "openai", "stub"], default: "stub" },
    fallbackReason: { type: String, default: "" },
  },
  { timestamps: true }
);

mealPlanSchema.pre("validate", function syncLegacyClientId(next) {
  if (!this.clientId && this.userId) {
    this.clientId = this.userId;
  }
  next();
});

mealPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

export const MealPlan = mongoose.models.MealPlan || mongoose.model("MealPlan", mealPlanSchema);
