// routes/adminImageRoutes.js
import { Router } from "express";
import multer from "multer";
import * as imageCtl from "../controllers/adminImageController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = Router();

// assert required exports
for (const name of ["getImages", "uploadImage", "deleteImage"]) {
  if (typeof imageCtl[name] !== "function") throw new Error(`adminImageController.${name} must be a function`);
}
if (typeof adminAuth !== "function") throw new Error("adminAuth middleware must be a function (default export).");

// Multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/jpg"];
    cb(allowed.includes(file.mimetype) ? null : new Error("Only image files are allowed"), true);
  },
});

/* --- API base: /api/admin/images --- */
// PUBLIC list
router.get("/", imageCtl.getImages);

// ADMIN actions
router.post("/upload", adminAuth, upload.single("image"), imageCtl.uploadImage);
router.delete("/:id", adminAuth, imageCtl.deleteImage);

// router-scoped multer errors
router.use((err, _req, res, _next) => {
  if (err?.name === "MulterError" || err?.message?.includes("Only image files")) {
    return res.status(400).json({ message: err.message });
  }
  return res.status(500).json({ message: "Upload error" });
});

export default router;
