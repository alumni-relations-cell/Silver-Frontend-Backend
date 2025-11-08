// controllers/eventController.js (ESM safe)

import * as RegistrationMod from "../models/Registration.js";
const Registration = RegistrationMod.default || RegistrationMod;

export async function registerEvent(req, res) {
  try {
    const { name, batch, contact, email, linkedin } = req.body;

    if (!name || !batch || !contact || !email) {
      return res
        .status(400)
        .json({ message: "Name, batch, contact, and email are required" });
    }

    // OAuth identity from JWT (userAuth middleware)
    const oauthEmail = req.user?.email;
    const oauthUid = req.user?.uid;

    if (!oauthEmail || !oauthUid) {
      return res.status(401).json({ message: "Missing user identity" });
    }

    // prevent duplicates by form email (existing behavior)
    const existing = await Registration.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const registration = new Registration({
      oauthEmail,
      oauthUid,
      name,
      batch,
      contact,
      email,
      linkedin,
    });

    await registration.save();
    return res.status(201).json({ message: "Registered successfully!" });
  } catch (error) {
    console.error("Error in registerEvent:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getAllRegistrations(_req, res) {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    return res.json(registrations);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
