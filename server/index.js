const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const cors = require("cors");

// Import routes
const authRoutes = require("./routes/auth.js");
const listingRoutes = require("./routes/listing.js");
const bookingRoutes = require("./routes/booking.js");
const userRoutes = require("./routes/user.js");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Routes
app.use("/auth", authRoutes);
app.use("/properties", listingRoutes);
app.use("/bookings", bookingRoutes);
app.use("/users", userRoutes);

// Mongoose setup
const PORT = 3001;

mongoose
  .connect(process.env.MONGO_URL, {
    dbName: "myAppDB", // Specify your database name
  })
  .then(() => {
    console.log("Connected to MongoDB successfully!");
    app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });
