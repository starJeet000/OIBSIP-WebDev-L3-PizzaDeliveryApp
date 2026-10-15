import Order from "../models/Order.js";

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

    // TODO: Note: Automated Stock Depletion will be integrated here during the Admin phase[cite: 1]

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
