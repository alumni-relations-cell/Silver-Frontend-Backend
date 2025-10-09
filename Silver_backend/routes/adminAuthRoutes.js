const express = require("express");
const router = express.Router();
const { registerAdmin, loginAdmin } = require("../controllers/adminAuthController");

// Register route — run once, then comment or remove for security
router.post("/register", registerAdmin);

// Login route
router.post("/login", loginAdmin);

module.exports = router;
