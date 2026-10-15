import crypto from "crypto";
import { razorpayInstance } from "../config/razorpay.js";

// @desc    Create a Razorpay Order
// @route   POST /api/payments/razorpay/order
// @access  Private
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, receiptId } = req.body; // amount expects the value in INR

    const options = {
      amount: amount * 100, // Razorpay expects amount in minimum currency units (paise)
      currency: "INR",
      receipt: receiptId || `receipt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);

    if (!order) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to create Razorpay order" });
    }

    res.status(200).json({
      success: true,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payments/razorpay/verify
// @access  Private
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // Create the expected signature using our secret key
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    // Compare the signatures
    const isAuthentic = expectedSignature === razorpaySignature;

    if (isAuthentic) {
      res.status(200).json({
        success: true,
        message: "Payment verified successfully", // Verifies the payment[cite: 1]
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
