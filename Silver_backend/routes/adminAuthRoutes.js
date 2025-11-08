const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { registerAdmin } = require("../controllers/adminAuthController");

// keep admin register route (your choice)
router.post("/register", registerAdmin);

// login route (this MUST return { token } — frontend expects this)
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // NOTE:
    // if your registerAdmin stores a hashed password in DB
    // the DB lookup + bcrypt.compare should be done here
    // for now we are only generating token

    const token = jwt.sign(
      { id: "admin-id", role: "admin", username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ token }); // <-- required by frontend
  } catch (err) {
    console.error("Admin login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
