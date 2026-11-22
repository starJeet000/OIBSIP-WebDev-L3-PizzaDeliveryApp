import Inventory from "../models/Inventory.js";

export const depleteStockForOrder = async (items, orderId) => {
  try {
    for (const item of items) {
      const qty = item.quantity;
      const { base, sauce, cheese, vegetables } = item.customizations || {};

      // Collect all ingredient names used in this pizza
      const ingredients = [base, sauce, cheese, ...(vegetables || [])].filter(
        Boolean,
      );

      for (const name of ingredients) {
        const inventoryItem = await Inventory.findOne({ name });

        if (inventoryItem) {
          const previousQuantity = inventoryItem.quantity;
          inventoryItem.quantity -= qty;

          inventoryItem.auditTrail.push({
            action: "Deplete",
            amount: qty,
            previousQuantity,
            newQuantity: inventoryItem.quantity,
            notes: `Consumed by Order ${orderId}`,
          });

          await inventoryItem.save();
        }
      }
    }
  } catch (error) {
    console.error("Inventory Depletion Error:", error);
  }
};

export const restockForOrder = async (items, orderId) => {
  try {
    for (const item of items) {
      const qty = item.quantity;
      const { base, sauce, cheese, vegetables } = item.customizations || {};
      const ingredients = [base, sauce, cheese, ...(vegetables || [])].filter(
        Boolean,
      );

      for (const name of ingredients) {
        const inventoryItem = await Inventory.findOne({ name });

        if (inventoryItem) {
          const previousQuantity = inventoryItem.quantity;
          inventoryItem.quantity += qty;

          inventoryItem.auditTrail.push({
            action: "Add",
            amount: qty,
            previousQuantity,
            newQuantity: inventoryItem.quantity,
            notes: `Restocked from cancelled Order ${orderId}`,
          });

          await inventoryItem.save();
        }
      }
    }
  } catch (error) {
    console.error("Inventory Restock Error:", error);
  }
};
