// controllers/adminImageController.js
import { v2 as cloudinary } from "cloudinary";
import Image from "../models/Image.js";
import streamifier from "streamifier";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";

let cloudinaryIsConfigured = false;
function ensureCloudinaryConfigured() {
  if (cloudinaryIsConfigured) return;
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary env vars missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.");
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
  cloudinaryIsConfigured = true;
}

function uploadBufferToCloudinary(buffer, folder = "silverjubilee") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

export const VALID_CATEGORIES = ["home_announcement", "home_memories", "memories_page"];

function isValidCategory(category) {
  return typeof category === "string" && VALID_CATEGORIES.includes(category.trim());
}

function approxBase64Bytes(dataUrl) {
  const idx = dataUrl.indexOf("base64,");
  if (idx === -1) return 0;
  const b64 = dataUrl.slice(idx + 7);
  return Math.floor((b64.length * 3) / 4);
}

async function processImageBuffer(inputBuffer) {
  return sharp(inputBuffer).rotate().toFormat("webp", { quality: 82 }).toBuffer();
}

/** POST /api/admin/images/upload  (admin) */
export async function uploadImage(req, res) {
  try {
    const category = (req.body?.category || "").trim();
    if (!isValidCategory(category)) {
      return res.status(400).json({ message: `Invalid or missing category. Valid: ${VALID_CATEGORIES.join(", ")}` });
    }

    const MAX_BYTES = 8 * 1024 * 1024;

    // Multer path
    if (req.file?.buffer) {
      if (req.file.size > MAX_BYTES) return res.status(400).json({ message: "File too large (max 8MB)" });

      const kind = await fileTypeFromBuffer(req.file.buffer);
      const allowed = ["image/png", "image/jpeg", "image/webp", "image/gif"];
      if (!kind || !allowed.includes(kind.mime)) {
        return res.status(400).json({ message: `Invalid image type: ${kind?.mime || "unknown"}` });
      }

      const processed = await processImageBuffer(req.file.buffer);

      ensureCloudinaryConfigured();
      const folder = `silverjubilee/${category}`;
      const result = await uploadBufferToCloudinary(processed, folder);

      if (!result?.secure_url || !result?.public_id) {
        console.error("[uploadImage] Cloudinary result unexpected:", result);
        return res.status(500).json({ message: "Failed to store image" });
      }

      const newImage = await Image.create({
        url: result.secure_url,
        public_id: result.public_id,
        category,
      });

      return res.status(201).json({
        _id: newImage._id,
        url: newImage.url,
        category: newImage.category,
        createdAt: newImage.createdAt,
      });
    }

    // Base64 path
    const dataUrl = req.body?.image;
    const dataUrlOk = typeof dataUrl === "string" && /^data:image\/(png|jpeg|jpg|webp|gif);base64,/.test(dataUrl);
    if (dataUrlOk) {
      const estBytes = approxBase64Bytes(dataUrl);
      if (estBytes === 0 || estBytes > MAX_BYTES) {
        return res.status(400).json({ message: "Base64 image too large (max 8MB)" });
      }

      const base64 = dataUrl.split("base64,")[1];
      const originalBuffer = Buffer.from(base64, "base64");
      const kind = await fileTypeFromBuffer(originalBuffer);
      const allowed = ["image/png", "image/jpeg", "image/webp", "image/gif"];
      if (!kind || !allowed.includes(kind.mime)) {
        return res.status(400).json({ message: `Invalid image type: ${kind?.mime || "unknown"}` });
      }

      const processed = await processImageBuffer(originalBuffer);

      ensureCloudinaryConfigured();
      const folder = `silverjubilee/${category}`;
      const result = await uploadBufferToCloudinary(processed, folder);

      if (!result?.secure_url || !result?.public_id) {
        console.error("[uploadImage:b64] Cloudinary result unexpected:", result);
        return res.status(500).json({ message: "Failed to store image" });
      }

      const newImage = await Image.create({
        url: result.secure_url,
        public_id: result.public_id,
        category,
      });

      return res.status(201).json({
        _id: newImage._id,
        url: newImage.url,
        category: newImage.category,
        createdAt: newImage.createdAt,
      });
    }

    return res.status(400).json({
      message:
        "No file uploaded. Send multipart/form-data with field 'image' (binary) + 'category', or a base64 data URL in 'image'.",
    });
  } catch (err) {
    if (err?.name === "MulterError") {
      console.warn("[uploadImage] multer error:", err.message);
      return res.status(400).json({ message: err.message || "File upload error" });
    }
    console.error("[uploadImage] unexpected error:", err);
    return res.status(500).json({ message: "Upload failed", error: err?.message });
  }
}

/** GET /api/admin/images?category=...  (public) */
export async function getImages(req, res) {
  try {
    const { category } = req.query;
    const filter = category && isValidCategory(category) ? { category } : {};
    const images = await Image.find(filter).sort({ createdAt: -1, _id: -1 });
    return res.json(images);
  } catch (err) {
    console.error("getImages error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/** DELETE /api/admin/images/:id  (admin) */
export async function deleteImage(req, res) {
  try {
    ensureCloudinaryConfigured();
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Image not found" });

    try {
      await cloudinary.uploader.destroy(image.public_id);
    } catch (e) {
      console.warn("Cloudinary destroy warning:", e?.message || e);
    }

    await image.deleteOne();
    return res.json({ ok: true });
  } catch (err) {
    console.error("deleteImage error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}
