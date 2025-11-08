const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");

// Register admin (run once, then comment/remove)
exports.registerAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    // prevent duplicate admin creation
    const exists = await Admin.findOne({ username });
    if (exists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = new Admin({ username, password });
    await admin.save();

    return res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    console.error("registerAdmin error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Login admin
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // token payload should include id + role + username
    const token = jwt.sign(
      {
        id: admin._id,
        role: "admin",
        username: admin.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ token });
  } catch (error) {
    console.error("loginAdmin error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
