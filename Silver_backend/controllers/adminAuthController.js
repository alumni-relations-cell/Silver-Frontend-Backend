// controllers/adminAuthController.js
import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";

/** POST /api/admin/auth/seed  { username, password } */
export async function seedAdmin(req, res) {
  try {
    const inProd = process.env.NODE_ENV === "production";
    const allowSeed = process.env.ALLOW_SEED === "true";
    if (inProd && !allowSeed) {
      return res.status(403).json({ message: "Seeding disabled in production" });
    }

    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: "username and password required" });
    }

    const existing = await Admin.findOne({ username });
    if (existing) return res.status(400).json({ message: "Admin already exists" });

    const admin = new Admin({ username, password }); // pre-save hook hashes
    await admin.save();

    return res.status(201).json({ message: "Admin seeded" });
  } catch (err) {
    console.error("seedAdmin error:", err);
    if (err?.code === 11000) return res.status(400).json({ message: "Duplicate key" });
    return res.status(500).json({ message: "Server error" });
  }
}

/** POST /api/admin/auth/login  { username, password } -> { token, expiresIn } + httpOnly cookie */
export async function login(req, res) {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: "username and password required" });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const match = await admin.matchPassword(password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const secret = process.env.ADMIN_JWT_SECRET;
    if (!secret) {
      console.error("ADMIN_JWT_SECRET missing");
      return res.status(500).json({ message: "Server misconfigured" });
    }

    const payload = { id: String(admin._id), username: admin.username, role: "admin" };
    const token = jwt.sign(payload, secret, { algorithm: "HS256", expiresIn: "1h" });

    const cookieOptions = {
      httpOnly: true,
      sameSite: "lax",            // use "strict" if admin UI is same-site
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 1000,
      path: "/",
    };
    res.cookie("adminToken", token, cookieOptions);

    return res.json({ token, expiresIn: 3600 });
  } catch (err) {
    console.error("admin login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/** POST /api/admin/auth/logout */
export async function logout(_req, res) {
  try {
    res.clearCookie("adminToken", { path: "/" });
    return res.json({ message: "Logged out" });
  } catch (err) {
    console.error("admin logout error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
