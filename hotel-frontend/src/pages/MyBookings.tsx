import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

interface Booking {
  _id: string;
  hotel: {
    name: string;
    city: string;
    pricePerNight: number;
    images?: string[];
  };
  checkInDate: string;
  checkOutDate: string;
  numberOfRoomsBooked: number;
  createdAt: string;
}

const MyBookings: React.FC = () => {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get("/bookings/mybookings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    if (token) fetchBookings();
  }, [token]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Bookings</h1>

      {bookings.length === 0 ? (
        <p>No bookings found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="border rounded shadow p-4">
              <img
                src={`http://localhost:5000/${booking.hotel.images?.[0]}`}
                alt={booking.hotel.name}
                className="w-full h-48 object-cover rounded mb-2"
              />
              <h2 className="text-lg font-bold">{booking.hotel.name}</h2>
              <p>City: {booking.hotel.city}</p>
              <p>Check-in: {new Date(booking.checkInDate).toLocaleDateString()}</p>
              <p>Check-out: {new Date(booking.checkOutDate).toLocaleDateString()}</p>
              <p>Rooms booked: {booking.numberOfRoomsBooked}</p>
              <p>Price per night: ${booking.hotel.pricePerNight}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
