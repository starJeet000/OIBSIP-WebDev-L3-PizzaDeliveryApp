import Order from "../models/Order.js";
import sendMail from "../utils/sendmail.js";
import { depleteStockForOrder } from "./inventoryController.js";

// @desc    Create new order
// @route   POST /api/orders/create
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, pricing, payment } = req.body;

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No order items provided" });
    }

    // Auto-generate unique order ID[cite: 1]
    const orderId = `ORD-${Date.now()}`;

    const order = new Order({
      orderId,
      userId: req.user._id,
      items,
      deliveryAddress,
      pricing,
      payment: {
        ...payment,
        status: "completed", // We only call this endpoint after Razorpay verifies the payment[cite: 1]
        timestamp: new Date(),
      },
      statusHistory: [{ status: "Order Received", updatedBy: "System" }],
    });

    const createdOrder = await order.save();

    // Send Order Confirmation Email
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff4d4f;">Order Confirmation</h2>
          <p>Hi ${req.user.name},</p>
          <p>Thank you for ordering from PizzaDash! We have received your order and our kitchen is getting ready to prepare it.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Order ID:</strong> ${createdOrder.orderId}</p>
            <p style="margin: 0 0 10px 0;"><strong>Total Amount:</strong> ₹${pricing.grandTotal}</p>
            <p style="margin: 0;"><strong>Expected Delivery:</strong> 30-45 minutes</p>
          </div>

          <a href="${process.env.FRONTEND_URL}/orders/${createdOrder._id}/success" 
             style="display: inline-block; padding: 12px 24px; background-color: #52c41a; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Track Your Order
          </a>
          
          <p style="margin-top: 30px; font-size: 12px; color: #666;">If you have any questions, please reply to this email.</p>
        </div>
      `;

      await sendMail({
        email: req.user.email,
        subject: `Order Confirmed: ${createdOrder.orderId} - PizzaDash`,
        html: emailHtml,
      });
    } catch (emailError) {
      console.error("Email confirmation could not be sent:", emailError);
      // We log the error but don't return an error response, as the order was successful
    }

    // Trigger background stock depletion
    await depleteStockForOrder(savedOrder.orderItems, savedOrder._id);

    res.status(201).json({
      success: true,
      orderId: createdOrder.orderId,
      _id: createdOrder._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order status for tracking
// @route   GET /api/orders/:orderId/status
// @access  Private
export const getOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Ensure only the order owner or an admin can view the status
    if (
      order.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized to view this order" });
    }

    // Calculate a mock estimated delivery time (e.g., 45 minutes from order creation)
    const estimatedDelivery = new Date(
      new Date(order.createdAt).getTime() + 45 * 60000,
    );

    // Mock delivery person details if the order is dispatched[cite: 1]
    const deliveryPerson = ["Sent to Delivery", "Delivered"].includes(
      order.status,
    )
      ? { name: "Rajesh Kumar", phone: "+91 9876543210" }
      : null;

    res.status(200).json({
      success: true,
      status: order.status,
      statusHistory: order.statusHistory,
      estimatedDelivery,
      deliveryPerson,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user orders with filters, search, and pagination
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
      search,
      sortBy,
    } = req.query;

    // Base query restricted to the current user
    let query = { userId: req.user._id };

    // Search by Order ID
    if (search) {
      query.orderId = { $regex: search, $options: "i" };
    }

    // Filter by Status
    if (status && status !== "All") {
      // Grouping 'Pending' logically (anything not Delivered or Cancelled)
      if (status === "Pending") {
        query.status = { $nin: ["Delivered", "Cancelled"] };
      } else {
        query.status = status;
      }
    }

    // Filter by Date Range
    if (startDate && endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: endOfDay,
      };
    }

    // Sorting configurations
    let sortConfig = { createdAt: -1 }; // Default: Most Recent
    if (sortBy === "amountDesc") sortConfig = { "pricing.grandTotal": -1 };
    if (sortBy === "dateAsc") sortConfig = { createdAt: 1 };

    const skip = (Number(page) - 1) * Number(limit);

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort(sortConfig)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      orders,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalOrders: total,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
