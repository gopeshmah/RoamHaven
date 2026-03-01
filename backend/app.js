const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Import Routes
const authRoutes = require("./routes/authRoutes");
const homeRoutes = require("./routes/homeRoutes");
const hostRoutes = require("./routes/hostRoutes");
const favouriteRoutes = require("./routes/favouriteRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();

// CORS - allow React dev server
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cloudinary Config
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/homes", homeRoutes);
app.use("/api/host", hostRoutes);
app.use("/api/favourites", favouriteRoutes);
app.use("/api/bookings", bookingRoutes);

// 404 handler for API
app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB:", err.message);
  });
