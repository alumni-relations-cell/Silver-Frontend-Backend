const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, required: true },
  category: { 
    type: String, 
    enum: ["home_announcement", "home_memories", "memories_page"], 
    required: true 
  },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Image", imageSchema);
  