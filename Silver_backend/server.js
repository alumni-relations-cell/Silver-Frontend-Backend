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

/* --- NEW: for secure receipt delivery --- */
import jwt from "jsonwebtoken";
import Registration from "./models/Registration.js";

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

/* ---------- User receipt (binary) ---------- */
/**
 * GET /api/event/registration/receipt
 * Returns the receipt image as binary.
 * Security:
 *  - If a valid admin JWT is presented (ADMIN_JWT_SECRET) AND ?id=<registrationId> provided,
 *    allow fetch by id (admin use-case).
 *  - Otherwise, require x-oauth-uid and return ONLY that user's receipt.
 * Notes:
 *  - CORS already allows x-oauth-uid; credentials are enabled.
 *  - We do NOT alter any other auth flow.
 */
app.get("/api/event/registration/receipt", async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    // check admin token (separate from user tokens; we don't change existing flows)
    let isAdmin = false;
    if (token && process.env.ADMIN_JWT_SECRET) {
      try {
        const payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
        if (payload && (payload.isAdmin || payload.role === "admin" || payload.sub)) {
          isAdmin = true;
        }
      } catch {
        // not an admin token, continue as user
      }
    }

    let reg = null;

    if (isAdmin && req.query.id) {
      // Admin fetching any registration via ?id=<registrationId>
      reg = await Registration.findById(req.query.id).lean(false);
    } else {
      // User fetching own receipt via oauthUid (ownership by field match)
      const oauthUid =
        req.get("x-oauth-uid") ||
        req.get("X-Oauth-Uid") ||
        req.query.oauthUid ||
        null;

      if (!oauthUid) {
        return res.status(401).json({ message: "Missing x-oauth-uid" });
      }

      reg = await Registration.findOne({ oauthUid }).lean(false);
    }

    if (!reg || !reg.receipt || !reg.receipt.data) {
      return res.status(404).json({ message: "Receipt not found" });
    }

    const ct = reg.receipt.contentType || "application/octet-stream";
    res.set("Content-Type", ct);
    res.set("Cache-Control", "private, no-store");
    res.send(reg.receipt.data);
  } catch (err) {
    console.error("receipt fetch error:", err?.message || err);
    res.status(500).json({ message: "Failed to load receipt" });
  }
});

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
