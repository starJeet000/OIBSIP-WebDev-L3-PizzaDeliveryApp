import "dotenv/config";
import mongoose from "mongoose";
import Inventory from "./models/Inventory.js";

const inventoryItems = [
  // Bases
  {
    name: "Thin Crust",
    category: "Base",
    quantity: 100,
    minThreshold: 20,
    maxLevel: 300,
  },
  {
    name: "Thick Crust",
    category: "Base",
    quantity: 80,
    minThreshold: 20,
    maxLevel: 300,
  },
  {
    name: "Stuffed Crust",
    category: "Base",
    quantity: 60,
    minThreshold: 15,
    maxLevel: 200,
  },
  {
    name: "Whole Wheat",
    category: "Base",
    quantity: 50,
    minThreshold: 15,
    maxLevel: 200,
  },
  {
    name: "Gluten-Free",
    category: "Base",
    quantity: 40,
    minThreshold: 10,
    maxLevel: 150,
  },
  // Sauces
  {
    name: "Tomato",
    category: "Sauce",
    quantity: 200,
    minThreshold: 50,
    maxLevel: 500,
  },
  {
    name: "White Cream",
    category: "Sauce",
    quantity: 150,
    minThreshold: 30,
    maxLevel: 400,
  },
  {
    name: "BBQ",
    category: "Sauce",
    quantity: 100,
    minThreshold: 20,
    maxLevel: 300,
  },
  {
    name: "Pesto",
    category: "Sauce",
    quantity: 80,
    minThreshold: 20,
    maxLevel: 200,
  },
  {
    name: "Garlic",
    category: "Sauce",
    quantity: 120,
    minThreshold: 25,
    maxLevel: 300,
  },
  // Cheeses
  {
    name: "Regular Mozzarella",
    category: "Cheese",
    quantity: 300,
    minThreshold: 50,
    maxLevel: 600,
  },
  {
    name: "Extra Mozzarella",
    category: "Cheese",
    quantity: 200,
    minThreshold: 30,
    maxLevel: 400,
  },
  {
    name: "Mixed Cheese",
    category: "Cheese",
    quantity: 150,
    minThreshold: 30,
    maxLevel: 400,
  },
  {
    name: "Vegan Cheese",
    category: "Cheese",
    quantity: 80,
    minThreshold: 20,
    maxLevel: 200,
  },
  // Vegetables
  {
    name: "Onions",
    category: "Vegetable",
    quantity: 150,
    minThreshold: 30,
    maxLevel: 300,
  },
  {
    name: "Bell Peppers",
    category: "Vegetable",
    quantity: 120,
    minThreshold: 30,
    maxLevel: 300,
  },
  {
    name: "Mushrooms",
    category: "Vegetable",
    quantity: 100,
    minThreshold: 25,
    maxLevel: 250,
  },
  {
    name: "Tomatoes",
    category: "Vegetable",
    quantity: 180,
    minThreshold: 40,
    maxLevel: 400,
  },
  {
    name: "Olives",
    category: "Vegetable",
    quantity: 90,
    minThreshold: 20,
    maxLevel: 200,
  },
  {
    name: "Pineapple",
    category: "Vegetable",
    quantity: 60,
    minThreshold: 15,
    maxLevel: 150,
  },
  {
    name: "Spinach",
    category: "Vegetable",
    quantity: 70,
    minThreshold: 20,
    maxLevel: 200,
  },
  {
    name: "Broccoli",
    category: "Vegetable",
    quantity: 50,
    minThreshold: 15,
    maxLevel: 150,
  },
  {
    name: "Corn",
    category: "Vegetable",
    quantity: 140,
    minThreshold: 30,
    maxLevel: 300,
  },
  {
    name: "Jalapenos",
    category: "Vegetable",
    quantity: 80,
    minThreshold: 20,
    maxLevel: 200,
  },
  {
    name: "Basil",
    category: "Vegetable",
    quantity: 40,
    minThreshold: 10,
    maxLevel: 100,
  },
  {
    name: "Garlic (Minced)",
    category: "Vegetable",
    quantity: 100,
    minThreshold: 20,
    maxLevel: 250,
  },
  {
    name: "Black Olives",
    category: "Vegetable",
    quantity: 85,
    minThreshold: 20,
    maxLevel: 200,
  },
  {
    name: "Green Peppers",
    category: "Vegetable",
    quantity: 110,
    minThreshold: 25,
    maxLevel: 250,
  },
  {
    name: "Sun-dried Tomatoes",
    category: "Vegetable",
    quantity: 60,
    minThreshold: 15,
    maxLevel: 150,
  },
];

const seedInventory = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    await Inventory.deleteMany({}); // Clear existing inventory
    await Inventory.insertMany(inventoryItems);

    console.log("Inventory successfully seeded!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding inventory:", error);
    process.exit(1);
  }
};

seedInventory();
