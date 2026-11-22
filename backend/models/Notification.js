import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // "low_stock", "order_status", "system_alert"
    recipient: { type: String, required: true }, // admin email
    subject: { type: String, required: true },
    message: { type: String, required: true },
    relatedItemId: { type: mongoose.Schema.Types.ObjectId }, // reference to inventory/order
    status: {
      type: String,
      enum: ["sent", "pending", "failed"],
      default: "pending",
    },
    sentAt: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.model("Notification", notificationSchema);
