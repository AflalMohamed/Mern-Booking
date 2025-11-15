import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./config/db";

// Routes
import authRoutes from "./routes/authRoutes";
import testRoutes from "./routes/testRoutes";
import adminRoutes from "./routes/adminRoutes";
import hotelRoutes from "./routes/hotelRoutes";

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder for images
// Make sure the path points to your uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/hotels", hotelRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("✅ Hotel Booking API is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
