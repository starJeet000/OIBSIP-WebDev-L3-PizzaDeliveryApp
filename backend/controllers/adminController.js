import Order from "../models/Order.js";
import User from "../models/User.js";

// @desc    Get Admin Dashboard Metrics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardMetrics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Key metrics calculations
    const todayOrders = await Order.find({ createdAt: { $gte: today } });
    const totalRevenueToday = todayOrders.reduce(
      (acc, order) => acc + (order.pricing?.grandTotal || 0),
      0,
    );
    const averageOrderValue =
      todayOrders.length > 0
        ? (totalRevenueToday / todayOrders.length).toFixed(2)
        : 0;

    const activeOrdersCount = await Order.countDocuments({
      status: { $in: ["In Kitchen", "Sent to Delivery"] },
    });

    const newSignupsToday = await User.countDocuments({
      createdAt: { $gte: today },
      role: "user",
    });

    // Mock chart data (In a production app, aggregate this from MongoDB)
    const dailyRevenueTrend = [
      { name: "Mon", revenue: 4000 },
      { name: "Tue", revenue: 3000 },
      { name: "Wed", revenue: 5000 },
      { name: "Thu", revenue: 4500 },
      { name: "Fri", revenue: 8000 },
      { name: "Sat", revenue: 9500 },
      { name: "Sun", revenue: 8500 },
    ];

    const topPizzas = [
      { name: "Margherita", count: 120 },
      { name: "Pepperoni", count: 98 },
      { name: "BBQ Chicken", count: 86 },
      { name: "Veggie Supreme", count: 75 },
      { name: "Hawaiian", count: 50 },
    ];

    const ordersPerHour = [
      { time: "10 AM", orders: 5 },
      { time: "11 AM", orders: 15 },
      { time: "12 PM", orders: 35 },
      { time: "1 PM", orders: 28 },
      { time: "2 PM", orders: 12 },
      { time: "3 PM", orders: 8 },
      { time: "4 PM", orders: 10 },
      { time: "5 PM", orders: 22 },
    ];

    res.status(200).json({
      success: true,
      metrics: {
        totalOrdersToday: todayOrders.length,
        totalRevenueToday,
        averageOrderValue,
        activeOrdersCount,
        newSignupsToday,
      },
      charts: {
        dailyRevenueTrend,
        topPizzas,
        ordersPerHour,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
