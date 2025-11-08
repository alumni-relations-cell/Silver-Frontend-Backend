// routes/event.js (ESM)

import { Router } from "express";
import * as eventController from "../controllers/eventController.js";
import userAuth from "../middleware/userAuth.js";

const { registerEvent, getAllRegistrations } = eventController;

const router = Router();

// Require user auth so we can capture oauthEmail/uid
router.post("/register", userAuth, registerEvent);

// Admin (or later) listing
router.get("/registrations", getAllRegistrations);

export default router;
