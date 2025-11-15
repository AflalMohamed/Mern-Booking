import React, { useState } from "react";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

interface BookingFormProps {
  hotelId: string;
  availableRooms: number;
}

const BookingForm: React.FC<BookingFormProps> = ({ hotelId, availableRooms }) => {
  const { token } = useAuth();
  const [checkInDate, setCheckInDate] = useState<string>("");
  const [checkOutDate, setCheckOutDate] = useState<string>("");
  const [numberOfRooms, setNumberOfRooms] = useState<number>(1);
  const [message, setMessage] = useState<string>("");

  const handleBooking = async () => {
    if (!checkInDate || !checkOutDate) {
      setMessage("Please select check-in and check-out dates");
      return;
    }

    try {
      // We don't need 'res' if we're not using it
      await axios.post(
        "/bookings",
        {
          hotel: hotelId, // match backend field name
          checkInDate,
          checkOutDate,
          numberOfRoomsBooked: numberOfRooms,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("Booking successful!");
      setNumberOfRooms(1);
      setCheckInDate("");
      setCheckOutDate("");
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Booking failed");
    }
  };

  if (!token) return <p className="text-red-500">Login to book</p>;

  return (
    <div className="mt-2 border-t pt-2">
      <div className="flex flex-col gap-2">
        <input
          type="date"
          value={checkInDate}
          onChange={(e) => setCheckInDate(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="date"
          value={checkOutDate}
          onChange={(e) => setCheckOutDate(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="number"
          value={numberOfRooms}
          min={1}
          max={availableRooms}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (value > availableRooms) setNumberOfRooms(availableRooms);
            else if (value < 1) setNumberOfRooms(1);
            else setNumberOfRooms(value);
          }}
          className="border px-2 py-1 rounded"
          placeholder={`Rooms (1-${availableRooms})`}
        />
        <button
          onClick={handleBooking}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
        >
          Book Now
        </button>
        {message && <p className="text-sm mt-1">{message}</p>}
      </div>
    </div>
  );
};

export default BookingForm;
