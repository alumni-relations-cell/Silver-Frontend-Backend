const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    public_id: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: ["home_announcement", "home_memories", "memories_page"],
      required: true
    }
  },
  { timestamps: true } // gives createdAt + updatedAt
);

// Sorting optimization
imageSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model("Image", imageSchema);
