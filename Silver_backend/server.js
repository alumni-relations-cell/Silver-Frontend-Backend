import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";


import googleAuth from "./routes/googleAuth.js";       // keep your existing file
import eventRoutes from "./routes/event.js";           // keep your existing file
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminImageRoutes from "./routes/adminImageRoutes.js";
import adminEventRoutes from "./routes/adminEvent.js"; // keep your existing file

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ---------- ENV sanity checks ---------- */
const isProd = process.env.NODE_ENV === "production";
if (!process.env.MONGO_URI) console.warn("[startup] WARNING: MONGO_URI is not set.");
if (!process.env.ADMIN_JWT_SECRET) console.warn("[startup] WARNING: ADMIN_JWT_SECRET is not set.");
if (!process.env.ALLOWED_ORIGINS) console.warn("[startup] WARNING: ALLOWED_ORIGINS not set — defaulting to http://localhost:5173");

/* ---------- CORS from env (robust) ---------- */
function parseOrigins(val) {
  return (val || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
const allowedOrigins = parseOrigins(process.env.ALLOWED_ORIGINS);
if (allowedOrigins.length === 0) allowedOrigins.push("http://localhost:5173");

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Oauth-Uid",
    "X-Oauth-Email",
    "x-oauth-uid",
    "x-oauth-email",
    "X-Requested-With",
    "Accept",
  ],
  exposedHeaders: ["Content-Length"],
  maxAge: 86400,
  optionsSuccessStatus: 204,
};

/* ---------- Basic request logging ---------- */
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/* ---------- Security & performance ---------- */
if (process.env.TRUST_PROXY === "true") app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

/* ---------- Static: uploaded receipts ---------- */
const receiptsDir = path.join(__dirname, "uploads", "receipts");
if (!fs.existsSync(receiptsDir)) fs.mkdirSync(receiptsDir, { recursive: true });

app.use(
  "/uploads/receipts",
  express.static(receiptsDir, {
    immutable: true,
    maxAge: "30d",
    setHeaders: (res) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
      res.setHeader("Content-Security-Policy", "default-src 'none'; img-src 'self' data: blob:;");
    },
  })
);

/* ---------- Rate limiter (login only) ---------- */
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { message: "Too many login attempts. Try again in 5 minutes." },
});
app.use("/api/admin/auth/login", loginLimiter);

/* ---------- Routes (API unchanged) ---------- */
app.use("/api/auth", googleAuth);
app.use("/api/event", eventRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/images", adminImageRoutes); // KEEPING ORIGINAL BASE
app.use("/api/admin/event", adminEventRoutes);

/* ---------- Health ---------- */
app.get("/health", (_req, res) => res.status(200).json({ ok: true }));

/* ---------- 404 ---------- */
app.use((req, res) => res.status(404).json({ message: "Not found" }));

/* ---------- Error handler ---------- */
app.use((err, req, res, _next) => {
  if (err?.message?.startsWith("CORS blocked for origin:")) {
    return res.status(403).json({ message: err.message });
  }
  if (!isProd) {
    console.error("Unhandled error:", err);
    return res.status(err.status || 500).json({ message: err.message || "Server error", stack: err.stack });
  } else {
    console.error("Unhandled error (prod):", err?.message || err);
    return res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
});

/* ---------- MongoDB connect & start ---------- */
const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "");
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }

  /* --- DROP LEGACY email INDEXES ONCE, THEN SYNC MODEL INDEXES --- */
  try {
    const col = mongoose.connection.db.collection("admins"); // Admin collection
    const idxs = await col.indexes();

    for (const idx of idxs) {
      if (idx.key && Object.prototype.hasOwnProperty.call(idx.key, "email")) {
        try {
          await col.dropIndex(idx.name);
          console.log(`[indexes] Dropped legacy index ${idx.name} on admins`);
        } catch (e) {
          if (e?.codeName !== "IndexNotFound") {
            console.warn(`[indexes] Warning dropping ${idx.name}:`, e.message || e);
          }
        }
      }
    }

    await mongoose.model("Admin").syncIndexes();
    console.log("[indexes] Admin indexes synced");
  } catch (e) {
    console.warn("[indexes] Unable to inspect/drop legacy indexes:", e.message || e);
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT} (env=${process.env.NODE_ENV || "development"})`);
    if (isProd) console.log("Production mode.");
    else console.log("Dev CORS origins:", allowedOrigins.join(", "));
  });
};

start();
