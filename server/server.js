import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();

const app = express();

// ===============================
// CORS CONFIGURATION
// ===============================
const allowedOrigins = [
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without origin
      // (Postman, server-to-server, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ===============================
// MIDDLEWARE
// ===============================
app.use(express.json());

// ===============================
// TEST ROUTE
// ===============================
app.get("/", (_, res) => {
  res.json({
    message: "StaySphere API is running",
  });
});

// ===============================
// API ROUTES
// ===============================
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);

// ===============================
// PORT
// ===============================
const PORT = process.env.PORT || 5000;

// ===============================
// MONGODB + SERVER
// ===============================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(
        `StaySphere API running on http://localhost:${PORT}`
      );
    });
  })
  .catch((err) => {
    console.error(
      "MongoDB connection failed:",
      err.message
    );

    process.exit(1);
  });