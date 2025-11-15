import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [city, setCity] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");

  const handleSearch = () => {
    if (!city || !checkInDate || !checkOutDate) {
      alert("Please fill all fields");
      return;
    }

    // 🔥 Pass clean data to SearchResults using router state (BEST method)
    navigate("/search", {
      state: {
        city,
        checkIn: checkInDate,
        checkOut: checkOutDate,
      },
    });
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 flex flex-col">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Header above overlay */}
      <div className="relative z-20">
        <Header hideAuthLinks />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 py-12">
        <h2 className="text-3xl font-extrabold text-white mb-6 text-center">
          Hello, {user?.username}!
        </h2>

        <div className="w-full max-w-md bg-white/80 rounded-3xl shadow-2xl border border-white/30 backdrop-blur-md p-10">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 text-center">
            Search Hotels
          </h1>

          <div className="flex flex-col gap-4">
            {/* City Input */}
            <div>
              <label className="block mb-1 font-semibold text-gray-700">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city"
                className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Check-in */}
            <div>
              <label className="block mb-1 font-semibold text-gray-700">
                Check-in Date
              </label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Check-out */}
            <div>
              <label className="block mb-1 font-semibold text-gray-700">
                Check-out Date
              </label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="w-full bg-indigo-700 text-white py-3 rounded-xl hover:bg-indigo-800 transition font-semibold mt-2"
            >
              Search Hotels
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
