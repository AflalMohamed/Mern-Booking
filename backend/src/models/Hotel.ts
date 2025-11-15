import mongoose, { Document, Schema } from "mongoose";

export interface IDateRange {
  start: Date;
  end: Date;
}

export interface IHotel extends Document {
  name: string;
  city: string;
  pricePerNight: number;
  totalRooms: number;
  description?: string;
  images: string[];
  availableDates: IDateRange[];
  maintenanceDates: IDateRange[];
}

const dateRangeSchema = new Schema<IDateRange>({
  start: { type: Date, required: true },
  end: { type: Date, required: true }
});

const hotelSchema = new Schema<IHotel>(
  {
    name: { type: String, required: true },
    city: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    totalRooms: { type: Number, required: true },
    description: String,
    images: [{ type: String }],

    availableDates: [dateRangeSchema],
    maintenanceDates: [dateRangeSchema]
  },
  { timestamps: true }
);

const Hotel = mongoose.model<IHotel>("Hotel", hotelSchema);
export default Hotel;
