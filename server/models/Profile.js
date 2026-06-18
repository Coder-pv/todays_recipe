import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    clientId: { type: String, sparse: true },
    username: { type: String, trim: true, default: "" },
    usernameLower: { type: String, trim: true, lowercase: true, sparse: true, unique: true },
    passwordHash: { type: String, default: "" },
    dietaryPreference: {
      type: String,
      enum: ["vegetarian", "vegan", "non_vegetarian"],
      default: "vegetarian",
    },
    allergies: [{ type: String, trim: true }],
    healthGoal: {
      type: String,
      enum: ["weight_loss", "weight_gain", "maintenance"],
      default: "maintenance",
    },
    dailyCalorieTarget: { type: Number, default: 2000, min: 500, max: 8000 },
    mealsPerDay: { type: Number, default: 3, min: 1, max: 4 },
    mealPattern: {
      type: String,
      enum: [
        "breakfast_lunch_snacks_dinner",
        "breakfast_lunch_dinner",
        "lunch_dinner",
        "meal_of_the_day",
      ],
      default: "breakfast_lunch_dinner",
    },
    mealDistribution: {
      type: String,
      enum: ["light_dinner", "balanced", "heavy_breakfast"],
      default: "balanced",
    },
    defaultServingPeople: { type: Number, default: 2, min: 1, max: 20 },
  },
  { timestamps: true }
);

profileSchema.pre("validate", function syncLegacyClientId(next) {
  if (!this.clientId && this.userId) {
    this.clientId = this.userId;
  }
  next();
});

profileSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.usernameLower;
    return ret;
  },
});

export const Profile = mongoose.models.Profile || mongoose.model("Profile", profileSchema);
