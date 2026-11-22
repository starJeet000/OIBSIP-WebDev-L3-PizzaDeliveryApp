import { checkLowStockAndNotify } from "./inventoryMonitor.js";
import cron from "node-cron";

export const initSchedulers = () => {
  console.log("[Scheduler] Initializing background jobs...");

  // Run the inventory check every hour
  cron.schedule("0 * * * *", async () => {
    console.log("[Cron] Running automated hourly stock check...");
    await checkLowStockAndNotify();
  });

  // You can add more cron jobs here in the future (e.g., clearing expired OTPs, daily sales reports)
};
