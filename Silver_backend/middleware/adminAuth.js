// middleware/adminAuth.js
import jwt from "jsonwebtoken";

function extractToken(req) {
  const h = (req.headers.authorization || "").trim();
  if (h) {
    const m = h.match(/^Bearer\s+(.+)$/i);
    if (m && m[1] && m[1] !== "undefined" && m[1] !== "null") return m[1].trim();
  }
  const ck = req.cookies?.adminToken;
  if (ck && ck !== "undefined" && ck !== "null") return ck;
  return null;
}

export default function requireAdmin(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      res.set("WWW-Authenticate", 'Bearer realm="admin", error="invalid_token", error_description="token missing"');
      return res.status(401).json({ message: "Admin token missing" });
    }

    const secret = process.env.ADMIN_JWT_SECRET;
    if (!secret) {
      console.error("[adminAuth] ADMIN_JWT_SECRET missing");
      return res.status(500).json({ message: "Server misconfigured" });
    }

    let payload;
    try {
      payload = jwt.verify(token, secret, { algorithms: ["HS256"], clockTolerance: 5 });
    } catch (err) {
      const expired = err?.name === "TokenExpiredError";
      res.set(
        "WWW-Authenticate",
        `Bearer realm="admin", error="invalid_token", error_description="${expired ? "token expired" : "token invalid"}"`
      );
      return res.status(401).json({ message: expired ? "Admin token expired" : "Invalid admin token" });
    }

    const isAdmin = payload?.role === "admin" || payload?.isAdmin === true;
    if (!isAdmin || !payload?.id) {
      return res.status(403).json({ message: "Forbidden: insufficient privileges" });
    }

    req.admin = { id: String(payload.id), username: payload.username || "admin", role: payload.role || "admin" };
    return next();
  } catch (err) {
    console.error("[adminAuth] unexpected error:", err);
    res.set("WWW-Authenticate", 'Bearer realm="admin", error="invalid_request"');
    return res.status(401).json({ message: "Invalid admin token" });
  }
}
