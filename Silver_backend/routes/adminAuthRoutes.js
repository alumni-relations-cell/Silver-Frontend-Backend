// routes/adminAuthRoutes.js
const express = require("express");
const router = express.Router();
const { registerAdmin, loginAdmin } = require("../controllers/adminAuthController");

// Optional: protect register with a setup key in env
router.post("/register", (req, res, next) => {
  const key = req.headers["x-setup-key"] || req.body?.setupKey;
  if (!process.env.ADMIN_SETUP_KEY) {
    return res.status(403).json({ message: "Admin registration disabled" });
  }
  if (key !== process.env.ADMIN_SETUP_KEY) {
    return res.status(403).json({ message: "Forbidden" });
  }
  return registerAdmin(req, res, next);
});

// Strict login (DB + hashed password check)
router.post("/login", loginAdmin);

module.exports = router;
