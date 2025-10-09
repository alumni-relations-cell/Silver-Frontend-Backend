const express = require("express");
const router = express.Router();
const { uploadImage, getImages, deleteImage } = require("../controllers/adminImageController");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload image
router.post("/upload", upload.single("image"), uploadImage);

// Get images by category
router.get("/", getImages);

// Delete image
router.delete("/:id", deleteImage);

module.exports = router;
