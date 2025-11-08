// controllers/adminAuthController.js
const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");

// Register admin (only when guarded by ADMIN_SETUP_KEY as above)
exports.registerAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Username and password required" });

    const exists = await Admin.findOne({ username: username.trim() });
    if (exists) return res.status(400).json({ message: "Admin already exists" });

    const admin = new Admin({ username: username.trim(), password });
    await admin.save();
    return res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    console.error("registerAdmin error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Login admin — checks DB + bcrypt (via model.matchPassword)
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Username and password required" });

    const admin = await Admin.findOne({ username: username.trim() });
    // Don’t reveal which field is wrong
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await admin.matchPassword(password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, role: "admin", username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ token });
  } catch (error) {
    console.error("loginAdmin error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
