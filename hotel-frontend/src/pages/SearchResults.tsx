import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

interface DateRange {
  start: string;
  end: string;
}

interface Hotel {
  _id: string;
  name: string;
  city: string;
  pricePerNight: number;
  totalRooms: number;
  images?: string[];
  description?: string;
  availableDates?: DateRange[];
  maintenanceDates?: DateRange[];
}

interface BookingData {
  hotelId: string;
  hotelName: string;
  city: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: number;
}

const pureDate = (d: string) => {
  const dt = new Date(d);
  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
};

const isFullRangeInside = (range: DateRange, checkIn: Date, checkOut: Date) => {
  const start = pureDate(range.start);
  const end = pureDate(range.end);
  return start <= checkIn && end >= checkOut;
};

export default function SearchResults() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as
    | { city: string; checkIn: string; checkOut: string }
    | undefined;

  const city = state?.city || "";
  const checkIn = state?.checkIn || "";
  const checkOut = state?.checkOut || "";

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  const checkInDate = pureDate(checkIn);
  const checkOutDate = pureDate(checkOut);

  const getNights = (start: Date, end: Date) => {
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const isHotelAvailable = (hotel: Hotel) => {
    const available = hotel.availableDates || [];
    const maintenance = hotel.maintenanceDates || [];

    const fullyAvailable =
      available.length === 0 ||
      available.some((r) => isFullRangeInside(r, checkInDate, checkOutDate));

    const maintenanceBlock = maintenance.some((r) => {
      const start = pureDate(r.start);
      const end = pureDate(r.end);
      return checkInDate <= end && checkOutDate >= start;
    });

    return fullyAvailable && !maintenanceBlock;
  };

  useEffect(() => {
    const loadHotels = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/hotels/search?city=${city}`);
        const list: Hotel[] = res.data;
        const filtered = list.filter((h) => isHotelAvailable(h));
        setHotels(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadHotels();
  }, [city, checkIn, checkOut]);

  const handleBook = async (hotel: Hotel) => {
    if (!user) {
      // Redirect guests to login
      navigate("/login");
      return;
    }

    try {
      const nights = getNights(checkInDate, checkOutDate);
      const totalPrice = hotel.pricePerNight * nights;

      const booking: BookingData = {
        hotelId: hotel._id,
        hotelName: hotel.name,
        city: hotel.city,
        checkIn,
        checkOut,
        nights,
        totalPrice,
      };

      // Save booking in DB with Authorization header
      await axios.post("/bookings", booking, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // WhatsApp confirmation
      const whatsappText = `Hi, I want to book ${hotel.name} in ${hotel.city} from ${checkIn} to ${checkOut} (${nights} nights). Total price: Rs. ${totalPrice}`;
      window.open(
        `https://wa.me/1234567890?text=${encodeURIComponent(whatsappText)}`,
        "_blank"
      );

      alert("Booking successful! WhatsApp confirmation opened.");
    } catch (err) {
      console.error(err);
      alert("Booking failed. Try again.");
    }
  };

  if (loading)
    return (
      <p className="text-center p-8 text-lg text-gray-600 animate-pulse">
        Loading hotels…
      </p>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md"
      >
        ← Back
      </button>

      <h2 className="text-3xl font-bold mb-8 text-gray-800">
        Hotels in {city} ({checkIn} – {checkOut})
      </h2>

      {hotels.length === 0 ? (
        <p className="text-center text-xl text-red-500 font-semibold">
          No hotels available for these dates.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {hotels.map((hotel) => {
            const nights = getNights(checkInDate, checkOutDate);
            const totalPrice = hotel.pricePerNight * nights;

            return (
              <div
                key={hotel._id}
                className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2 hover:scale-105 duration-300"
              >
                {/* Hotel Image */}
                <div className="relative">
                  <img
                    src={
                      hotel.images?.[0]
                        ? `http://localhost:5000/uploads/${hotel.images[0]}`
                        : "https://via.placeholder.com/400x250"
                    }
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-4 py-1 rounded-full font-semibold shadow-lg">
                    Rs. {hotel.pricePerNight}/night
                  </div>
                </div>

                {/* Hotel Details */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800">{hotel.name}</h3>
                  <p className="text-gray-600 mt-1 mb-2">🏙️ {hotel.city}</p>
                  <p className="text-gray-700 font-medium">Rooms: {hotel.totalRooms}</p>
                  {hotel.description && (
                    <p className="text-gray-600 mt-2 text-sm">{hotel.description}</p>
                  )}

                  <p className="text-gray-800 font-semibold mt-4">
                    Total for {nights} night{nights > 1 ? "s" : ""}: Rs. {totalPrice}
                  </p>

                  {/* Book button: only works for logged-in users */}
                  <button
                    onClick={() => handleBook(hotel)}
                    className="mt-4 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-3 rounded-xl hover:scale-105 hover:shadow-xl transition font-bold"
                  >
                    {user ? "Book Now" : "Login to Book"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
