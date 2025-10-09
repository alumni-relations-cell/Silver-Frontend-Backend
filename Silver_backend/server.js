require("dotenv").config({ path: "./.env" });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// --- Basic logging for debugging route requests (helpful for 404) ---
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Middlewares (order matters: parse before routes)
app.use(
  cors({
    origin : "http://localhost:5173", // adjust as needed
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,  
    }));
app.use(express.json()); // parse JSON bodies
app.use(cookieParser()); // parse cookies

// Routes (mount after middleware)
const eventRoutes = require("./routes/event");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const adminImageRoutes = require("./routes/adminImageRoutes");

app.use("/api/event", eventRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/images", adminImageRoutes);

// Debug: env var check
console.log("MONGO_URI:", process.env.MONGO_URI);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Global error handler (simple)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Server error" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
