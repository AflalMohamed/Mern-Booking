import express from "express";
import { protectUser, protectAdmin } from "../middleware/authMiddleware";

const router = express.Router();

// Protected route (any logged-in user)
router.get("/profile", protectUser, (req, res) => {
  res.json({ message: "You are logged in as a user!" });
});

// Admin-only route
router.get("/admin", protectUser, protectAdmin, (req, res) => {
  res.json({ message: "Welcome Admin! You have special privileges." });
});

export default router;
