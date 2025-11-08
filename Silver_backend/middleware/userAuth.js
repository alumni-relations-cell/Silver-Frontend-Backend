// middleware/userAuth.js (ESM) — USER TOKENS ONLY
import jwt from "jsonwebtoken";

export default function userAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const [type, token] = auth.split(" ");
    if (type !== "Bearer" || !token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // we issued { uid, email, role: "user" } for Google logins
    if (decoded.role !== "user") {
      return res.status(403).json({ message: "User access required" });
    }

    req.user = { uid: decoded.uid, email: decoded.email, role: "user" };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
