import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pricing: {
      subtotal: Number,
      tax: Number,
      deliveryFee: Number,
      grandTotal: Number,
    },
    status: { type: String, default: "Order Received" },
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
