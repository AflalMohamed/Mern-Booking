import { Request, Response } from "express";
import Hotel from "../models/Hotel";

export const searchHotels = async (req: Request, res: Response) => {
  try {
    const { city } = req.query;

    const hotels = await Hotel.find(
      city ? { city: { $regex: new RegExp(city as string, "i") } } : {}
    ).lean();

    // Format all dates → "YYYY-MM-DD"
    const formatDate = (d: Date) => {
      const dt = new Date(d);
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, "0");
      const day = String(dt.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const formattedHotels = hotels.map((hotel: any) => {
      return {
        ...hotel,

        availableDates: (hotel.availableDates || []).map((r: any) => ({
          start: formatDate(r.start),
          end: formatDate(r.end),
        })),

        maintenanceDates: (hotel.maintenanceDates || []).map((r: any) => ({
          start: formatDate(r.start),
          end: formatDate(r.end),
        })),
      };
    });

    return res.json(formattedHotels);
  } catch (err) {
    console.error("Search hotel error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
