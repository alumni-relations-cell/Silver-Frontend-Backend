const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/jpg"].includes(file.mimetype);
    cb(ok ? null : new Error("Only image files are allowed"), ok);
  },
});

const requireAdmin = require("../middleware/authMiddleware");
const { uploadImage, getImages, deleteImage } = require("../controllers/adminImageController");

// PUBLIC
router.get("/", getImages);

// ADMIN
router.post("/upload", requireAdmin, upload.single("image"), uploadImage);
router.delete("/:id", requireAdmin, deleteImage);

module.exports = router;
