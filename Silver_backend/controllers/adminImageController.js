// controllers/adminImageController.js
const cloudinary = require("cloudinary").v2;
const Image = require("../models/Image");
const streamifier = require("streamifier");

// -------------------------------
// Cloudinary Configuration
// -------------------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// -------------------------------
// Helper: upload buffer to Cloudinary using stream
// -------------------------------
function uploadBufferToCloudinary(buffer, folder = "silverjubilee") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// -------------------------------
// Upload Image
// -------------------------------
exports.uploadImage = async (req, res) => {
  try {
    console.log("uploadImage controller called");
    console.log("Body:", req.body);
    console.log("File object present:", !!req.file);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded (req.file is empty)" });
    }

    const { category } = req.body;
    const validCategories = ["home_announcement", "home_memories", "memories_page"];
    if (!category || !validCategories.includes(category)) {
      return res.status(400).json({
        message: `Invalid or missing category. Must be one of: ${validCategories.join(", ")}`
      });
    }

    const result = await uploadBufferToCloudinary(req.file.buffer, `silverjubilee/${category}`);

    const newImage = new Image({
      url: result.secure_url,
      public_id: result.public_id,
      category,
    });

    await newImage.save();

    return res.status(201).json({ message: "Image uploaded successfully", image: newImage });
  } catch (err) {
    console.error("uploadImage error:", err);
    return res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

// -------------------------------
// Get Images by Category
// -------------------------------
exports.getImages = async (req, res) => {
  try {
    const { category } = req.query;
    const validCategories = ["home_announcement", "home_memories", "memories_page"];
    
    const filter = category && validCategories.includes(category) ? { category } : {};
    const images = await Image.find(filter).sort({ uploadedAt: -1 });

    res.json(images);
  } catch (err) {
    console.error("getImages error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------------------
// Delete Image
// -------------------------------
exports.deleteImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Image not found" });

    await cloudinary.uploader.destroy(image.public_id);
    await image.deleteOne();

    res.json({ message: "Image deleted successfully" });
  } catch (err) {
    console.error("deleteImage error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
