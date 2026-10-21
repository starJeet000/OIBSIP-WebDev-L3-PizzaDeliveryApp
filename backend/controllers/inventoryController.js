import Inventory from "../models/Inventory.js";
import sendMail from "../services/emailService.js";

// @desc    Get all inventory items (paginated)
// @route   GET /api/inventory
// @access  Private/Admin
export const getInventory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; // Pagination: 20 items per page
    const skip = (page - 1) * limit;

    const total = await Inventory.countDocuments();
    const items = await Inventory.find()
      .skip(skip)
      .limit(limit)
      .sort({ category: 1, name: 1 });

    res.status(200).json({
      success: true,
      items,
      page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update stock quantity manually
// @route   PUT /api/inventory/:id
// @access  Private/Admin
export const updateStock = async (req, res) => {
  try {
    const { action, amount, notes } = req.body;
    const item = await Inventory.findById(req.params.id);

    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });

    const prevQty = item.quantity;
    if (action === "Add") {
      item.quantity += Number(amount);
    } else if (action === "Set") {
      item.quantity = Number(amount);
    }

    item.auditTrail.push({
      action,
      amount: Number(amount),
      previousQuantity: prevQty,
      newQuantity: item.quantity,
      notes,
      timestamp: new Date(),
    });

    await item.save();

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      item,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add this export at the bottom of the file
// @desc    Get low stock alerts
// @route   GET /api/inventory/alerts
// @access  Private/Admin
export const getLowStockAlerts = async (req, res) => {
  try {
    // Find items where current quantity is less than or equal to minThreshold
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ["$quantity", "$minThreshold"] },
    }).sort({ quantity: 1 });

    res.status(200).json({
      success: true,
      count: lowStockItems.length,
      items: lowStockItems,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Deplete inventory based on order items
// @access  Internal Helper (Called from Order Controller)
export const depleteStockForOrder = async (orderItems, orderId) => {
  try {
    const ingredientsUsed = [];

    // Extract all individual ingredients from the custom pizza configurations
    orderItems.forEach((item) => {
      const qty = item.qty || 1; // Number of pizzas
      if (item.base) ingredientsUsed.push({ name: item.base, qty });
      if (item.sauce) ingredientsUsed.push({ name: item.sauce, qty });
      if (item.cheese) ingredientsUsed.push({ name: item.cheese, qty });

      if (item.veggies && Array.isArray(item.veggies)) {
        item.veggies.forEach((veg) => ingredientsUsed.push({ name: veg, qty }));
      }
    });

    // Update database for each ingredient
    for (const ingredient of ingredientsUsed) {
      const dbItem = await Inventory.findOne({ name: ingredient.name });

      if (dbItem) {
        const prevQty = dbItem.quantity;
        dbItem.quantity -= ingredient.qty;

        // Add to audit trail
        dbItem.auditTrail.push({
          action: "Deplete",
          amount: ingredient.qty,
          previousQuantity: prevQty,
          newQuantity: dbItem.quantity,
          notes: `Automated deduction for Order ID: ${orderId}`,
          timestamp: new Date(),
        });

        await dbItem.save();

        // Immediate Low Stock Trigger check
        if (dbItem.quantity <= dbItem.minThreshold) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (
            !dbItem.lastNotificationSentAt ||
            dbItem.lastNotificationSentAt < today
          ) {
            await sendMail({
              email: process.env.GMAIL_USER,
              subject: `🚨 URGENT: Stock Depleted - ${dbItem.name}`,
              html: `<h2>Low Stock Alert</h2><p><strong>${dbItem.name}</strong> has fallen below threshold (${dbItem.quantity} left) due to Order ${orderId}. Restock required.</p>`,
            });
            dbItem.lastNotificationSentAt = new Date();
            await dbItem.save();
          }
        }
      }
    }
  } catch (error) {
    console.error("Inventory Depletion Error:", error);
  }
};
