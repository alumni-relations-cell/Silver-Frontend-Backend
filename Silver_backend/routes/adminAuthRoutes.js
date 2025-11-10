// routes/adminAuthRoutes.js
import express from "express";
import { seedAdmin, login, logout } from "../controllers/adminAuthController.js";

const router = express.Router();

// /api/admin/auth/*
router.post("/seed", seedAdmin);  // dev-only; guarded in controller
router.post("/login", login);
router.post("/logout", logout);

export default router;
