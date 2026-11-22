import "./services/inventoryMonitor.js";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import pizzaRoutes from "./routes/pizzaRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import { initSchedulers } from "./services/schedulerService.js";

initSchedulers();

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.json());

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173", // Match your Vite port
    methods: ["GET", "POST", "PUT"],
  },
});

// Make io available globally in your express app
app.set("io", io);

// Handle client connections
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Client requests to join a specific order room
  socket.on("joinOrderRoom", (orderId) => {
    socket.join(orderId);
    console.log(`User joined room for order: ${orderId}`);
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(cors());
app.use(express.json()); // Allows parsing of JSON payloads

// Basic health check route
app.get("/", (req, res) => {
  res.send("Pizza Delivery API is running...");
});

// mount our routes here
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/pizzas", pizzaRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/inventory", inventoryRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
  );
});
