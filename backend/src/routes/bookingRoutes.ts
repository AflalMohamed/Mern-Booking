import express from "express";
import { createBooking, getMyBookings } from "../controllers/bookingController";
import { protectUser } from "../middleware/authMiddleware";

const router = express.Router();

// Create booking
router.post("/", protectUser, createBooking);

// Get bookings for current user
router.get("/mybookings", protectUser, getMyBookings);

export default router;
