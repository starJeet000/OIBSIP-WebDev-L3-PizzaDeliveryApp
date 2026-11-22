import mongoose from "mongoose";

// Sub-schema for items using Mixed types for customizations to support frontend objects
const orderItemSchema = new mongoose.Schema(
  {
    pizzaType: { type: String, required: true },
    customizations: {
      base: { type: mongoose.Schema.Types.Mixed },
      sauce: { type: mongoose.Schema.Types.Mixed },
      cheese: { type: mongoose.Schema.Types.Mixed },
      vegetables: [{ type: String }],
    },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
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
      required: true,
      enum: [
        "Order Received",
        "In Kitchen",
        "Sent to Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Order Received",
    },
    statusTimeline: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        updatedBy: String,
        note: String,
      },
    ],
    internalNotes: { type: String },
    cancellationDetails: {
      reason: { type: String },
      notes: { type: String },
      refunded: { type: Boolean, default: false },
      cancelledAt: { type: Date },
    },
  },
  { timestamps: true },
);

// Pre-save middleware to initialize timeline on new orders
orderSchema.pre("save", function () {
  if (
    this.isNew &&
    (!this.statusTimeline || this.statusTimeline.length === 0)
  ) {
    this.statusTimeline = [
      {
        status: "Order Received",
        timestamp: new Date(),
        updatedBy: "System",
      },
    ];
  }
});

export default mongoose.model("Order", orderSchema);
