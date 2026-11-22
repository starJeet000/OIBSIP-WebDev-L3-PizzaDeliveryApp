import cron from "node-cron";
import Inventory from "../models/Inventory.js";
import sendMail from "./emailService.js";

// Function to perform the stock check and send emails
export const checkLowStockAndNotify = async () => {
  try {
    // Find items where quantity is <= minThreshold
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ["$quantity", "$minThreshold"] },
    });

    if (lowStockItems.length === 0) return;

    // Set 'today' to midnight to check if an email was already sent today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const item of lowStockItems) {
      // Prevent spam: Only send if no email was sent today
      if (!item.lastNotificationSentAt || item.lastNotificationSentAt < today) {
        const mailOptions = {
          email: process.env.GMAIL_USER, // Admin receives the email
          subject: `🚨 ALERT: Low Stock - ${item.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; max-width: 600px;">
              <h2 style="color: #cf1322;">Low Stock Alert</h2>
              <p>The following inventory item has fallen below its minimum threshold.</p>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <tr style="background-color: #f5f5f5;">
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Item Name</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Current Quantity</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd; color: #cf1322; font-weight: bold;">${item.quantity}</td>
                </tr>
                <tr style="background-color: #f5f5f5;">
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Minimum Threshold</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${item.minThreshold}</td>
                </tr>
              </table>
              <p style="margin-top: 20px; font-weight: bold; color: #d48806;">Recommendation: Please restock immediately.</p>
              <p style="font-size: 12px; color: #888; margin-top: 30px;">System Timestamp: ${new Date().toLocaleString()}</p>
            </div>
          `,
        };

        // Send email and update the timestamp
        await sendMail(mailOptions);
        item.lastNotificationSentAt = new Date();
        await item.save();

        console.log(
          `[Cron] Notification sent for low stock item: ${item.name}`,
        );
      }
    }
  } catch (error) {
    console.error("Error in scheduled stock check:", error);
  }
};

// Schedule: Run every 1 hour (cron format: "0 * * * *")
cron.schedule("0 * * * *", () => {
  console.log("Running automated hourly stock check...");
  checkLowStockAndNotify();
});
