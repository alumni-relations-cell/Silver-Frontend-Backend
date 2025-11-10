// models/Admin.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const AdminSchema = new mongoose.Schema(
  {
    // single identity field; can be an email or a plain string
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// hash password on save
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// compare
AdminSchema.methods.matchPassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
export default Admin;
