import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true }, // "ORD-" + timestamp
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        pizzaType: { type: String, required: true }, // Name of the pizza
        customizations: {
          base: { type: Object },
          sauce: { type: Object },
          cheese: { type: Object },
          vegetables: [{ type: String }],
        },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
      },
    ],
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      instructions: String,
    },
    pricing: {
      subtotal: { type: Number, required: true },
      tax: { type: Number, required: true },
      deliveryFee: { type: Number, required: true },
      couponDiscount: { type: Number, default: 0 },
      grandTotal: { type: Number, required: true },
    },
    payment: {
      method: { type: String, default: "razorpay" },
      status: {
        type: String,
        enum: ["completed", "pending", "failed"],
        default: "pending",
      },
      razorpayOrderId: String,
      razorpayPaymentId: String,
      transactionId: String,
      amount: Number,
      timestamp: Date,
    },
    status: {
      type: String,
      enum: [
        "Order Received",
        "In Kitchen",
        "Sent to Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Order Received",
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        updatedBy: String, // system or admin email
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
