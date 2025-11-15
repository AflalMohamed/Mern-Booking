import mongoose, { Document, Schema } from "mongoose";

export interface IBooking extends Document {
  hotel: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfRoomsBooked: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const bookingSchema: Schema<IBooking> = new mongoose.Schema(
  {
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    numberOfRoomsBooked: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

const Booking = mongoose.model<IBooking>("Booking", bookingSchema);
export default Booking;
