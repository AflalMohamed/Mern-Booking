import { Request, Response } from "express";
import Hotel, { IHotel } from "../models/Hotel";

// Helper to parse dates whether string or array
const parseDates = (data: any): { start: string; end: string }[] => {
  if (!data) return [];
  if (typeof data === "string") return JSON.parse(data);
  if (Array.isArray(data)) return data;
  return [];
};

// ---------------------------
// Get all hotels
// ---------------------------
export const getHotels = async (req: Request, res: Response) => {
  try {
    const hotels = await Hotel.find();
    res.status(200).json(hotels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch hotels", error: err });
  }
};

// ---------------------------
// Add hotel
// ---------------------------
export const addHotel = async (req: Request, res: Response) => {
  try {
    const {
      name,
      city,
      pricePerNight,
      totalRooms,
      description,
      availableDates,
      maintenanceDates,
    } = req.body;

    const images = req.files
      ? (req.files as Express.Multer.File[]).map((file) => file.filename)
      : [];

    const hotel = new Hotel({
      name,
      city,
      pricePerNight,
      totalRooms,
      description,
      images,
      availableDates: parseDates(availableDates),
      maintenanceDates: parseDates(maintenanceDates),
    });

    await hotel.save();
    res.status(201).json(hotel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add hotel", error: err });
  }
};

// ---------------------------
// Update hotel by ID
// ---------------------------
export const updateHotel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      city,
      pricePerNight,
      totalRooms,
      description,
      availableDates,
      maintenanceDates,
      existingImages, // frontend sends images to keep
    } = req.body;

    const newImages = req.files
      ? (req.files as Express.Multer.File[]).map((file) => file.filename)
      : [];

    // Combine existing images (kept by admin) + new uploads
    const finalImages = existingImages
      ? [...parseDates(existingImages), ...newImages]
      : newImages;

    const updatedHotel = await Hotel.findByIdAndUpdate(
      id,
      {
        name,
        city,
        pricePerNight,
        totalRooms,
        description,
        images: finalImages,
        availableDates: parseDates(availableDates),
        maintenanceDates: parseDates(maintenanceDates),
      },
      { new: true }
    );

    res.status(200).json(updatedHotel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update hotel", error: err });
  }
};

// ---------------------------
// Delete hotel by ID
// ---------------------------
export const deleteHotel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Hotel.findByIdAndDelete(id);
    res.status(200).json({ message: "Hotel deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete hotel", error: err });
  }
};
