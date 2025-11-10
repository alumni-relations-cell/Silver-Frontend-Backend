// models/Image.js
import mongoose from "mongoose";

export const IMAGE_CATEGORIES = ["home_announcement", "home_memories", "memories_page"];

const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
    category: { type: String, enum: IMAGE_CATEGORIES, required: true },
  },
  { timestamps: true }
);

const Image = mongoose.models.Image || mongoose.model("Image", ImageSchema);
export default Image;
