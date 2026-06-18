import mongoose from "mongoose";

const pantryItemSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    clientId: { type: String, sparse: true },
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, default: "unit", trim: true },
    imageUrl: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

pantryItemSchema.pre("validate", function syncLegacyClientId(next) {
  if (!this.clientId && this.userId) {
    this.clientId = this.userId;
  }
  next();
});

pantryItemSchema.index({ userId: 1, name: 1 });

export const PantryItem =
  mongoose.models.PantryItem || mongoose.model("PantryItem", pantryItemSchema);
