require("dotenv").config({ path: "./.env" });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const compression = require("compression");

const app = express();

/* ---------- CORS from env ---------- */
function parseOrigins(val) {
  return (val || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
const allowedOrigins = parseOrigins(process.env.ALLOWED_ORIGINS);
if (allowedOrigins.length === 0) allowedOrigins.push("http://localhost:5173");

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); // allow curl/postman
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Length"],
  maxAge: 86400,
};

/* ---------- Basic logging ---------- */
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/* ---------- Core middleware ---------- */
if (process.env.TRUST_PROXY === "true") app.set("trust proxy", 1);
app.use(cors(corsOptions));              // preflight handled automatically
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

/* ---------- Routes ---------- */
const eventRoutes = require("./routes/event");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const adminImageRoutes = require("./routes/adminImageRoutes");

app.use("/api/event", eventRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/images", adminImageRoutes);

// health
app.get("/health", (_req, res) => res.status(200).json({ ok: true }));

/* ---------- 404 & Errors ---------- */
app.use((req, res) => res.status(404).json({ message: "Not found" }));
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

/* ---------- Mongo ---------- */
console.log("MONGO_URI:", process.env.MONGO_URI ? "set" : "missing");
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

/* ---------- Start ---------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
