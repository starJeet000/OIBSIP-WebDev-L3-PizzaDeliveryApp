import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    category: {
      type: String,
      required: true,
      enum: ["Base", "Sauce", "Cheese", "Vegetable"],
    },
    quantity: { type: Number, required: true, default: 0 },
    minThreshold: { type: Number, required: true, default: 20 },
    maxLevel: { type: Number, default: 500 },
    lastNotificationSentAt: { type: Date, default: null },
    auditTrail: [
      {
        action: { type: String, enum: ["Add", "Set", "Deplete"] },
        amount: Number,
        previousQuantity: Number,
        newQuantity: Number,
        notes: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Inventory", inventorySchema);
