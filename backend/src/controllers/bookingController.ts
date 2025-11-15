import { Request, Response } from "express";
import Booking from "../models/Booking";
import Hotel from "../models/Hotel";

interface AuthenticatedRequest extends Request {
  user?: any;
}

/**
 * @desc Create a booking
 * @route POST /api/bookings
 * @access User
 */
export const createBooking = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { hotelId, checkInDate, checkOutDate, numberOfRoomsBooked } = req.body;

    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (checkIn >= checkOut) return res.status(400).json({ message: "Check-out must be after check-in" });

    // Fetch hotel
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    // Check availability
    const bookings = await Booking.find({ hotel: hotelId });
    let roomsBooked = 0;
    for (const booking of bookings) {
      if (checkIn < booking.checkOutDate && checkOut > booking.checkInDate) {
        roomsBooked += booking.numberOfRoomsBooked;
      }
    }

    const availableRooms = hotel.totalRooms - roomsBooked;
    if (numberOfRoomsBooked > availableRooms) {
      return res.status(400).json({ message: `Only ${availableRooms} rooms available` });
    }

    // Create booking
    const newBooking = await Booking.create({
      hotel: hotelId,
      user: req.user?._id,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfRoomsBooked,
    });

    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ message: "Failed to create booking", error });
  }
};

/**
 * @desc Get all bookings for logged-in user
 * @route GET /api/bookings/mybookings
 * @access User
 */
export const getMyBookings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const bookings = await Booking.find({ user: req.user?._id }).populate("hotel");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings", error });
  }
};
