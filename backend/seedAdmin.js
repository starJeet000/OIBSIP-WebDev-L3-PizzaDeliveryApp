import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js"; // Ensure this matches your User model path

// Load environment variables to get MONGODB_URI
dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if an admin already exists
    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      console.log("Admin user already exists in the database.");
      process.exit(0);
    }

    // Create the admin user
    const adminUser = new User({
      name: "System Admin",
      email: "admin@pizzadash.com",
      password: "adminpassword123", // Your User model's pre-save hook will hash this automatically
      role: "admin",
      phone: "0000000000",
    });

    await adminUser.save();
    console.log("Success! Admin user created.");
    console.log("Email: admin@pizzadash.com");
    console.log("Password: adminpassword123");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
