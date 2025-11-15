import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { FaHotel, FaRegClock, FaHeadset } from "react-icons/fa";

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Search form state
  const [city, setCity] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const handleSearch = () => {
    if (!city || !checkIn || !checkOut) {
      alert("Please fill all fields to search hotels.");
      return;
    }
    navigate("/search", { state: { city, checkIn, checkOut } });
  };

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-500 to-indigo-600 min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-3xl shadow-xl p-10 md:p-16 max-w-3xl mx-auto animate-fadeIn">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Welcome {user ? user.username : "Guest"}!
            </h1>
            <p className="text-gray-700 text-lg md:text-xl mb-8">
              {user
                ? "Search for hotels in your favorite city and book the perfect stay."
                : "Login or register to explore amazing hotels and make your stay unforgettable."}
            </p>

            {/* Search Form */}
            <div className="flex flex-col md:flex-row gap-3 justify-center mb-6">
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="px-4 py-2 rounded-xl border w-full md:w-1/3"
              />
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="px-4 py-2 rounded-xl border w-full md:w-1/4"
              />
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="px-4 py-2 rounded-xl border w-full md:w-1/4"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300"
              >
                Search
              </button>
            </div>

            {/* If not logged in, show login/register */}
            {!user && (
              <div className="flex justify-center gap-6 mt-4">
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-8 py-3 bg-green-500 text-white font-semibold rounded-xl shadow-lg hover:bg-green-600 hover:shadow-xl transition-all duration-300"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-gray-900">
            Why Choose Our Platform?
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-transform transform hover:-translate-y-1 duration-300">
              <div className="text-blue-600 text-4xl mb-4 flex justify-center">
                <FaHotel />
              </div>
              <h3 className="font-semibold text-xl mb-2">Best Hotels</h3>
              <p className="text-gray-600">
                We partner with top-rated hotels to ensure you get the best experience.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-transform transform hover:-translate-y-1 duration-300">
              <div className="text-green-500 text-4xl mb-4 flex justify-center">
                <FaRegClock />
              </div>
              <h3 className="font-semibold text-xl mb-2">Easy Booking</h3>
              <p className="text-gray-600">
                Book your stay in just a few clicks with our simple and secure platform.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-transform transform hover:-translate-y-1 duration-300">
              <div className="text-purple-600 text-4xl mb-4 flex justify-center">
                <FaHeadset />
              </div>
              <h3 className="font-semibold text-xl mb-2">24/7 Support</h3>
              <p className="text-gray-600">
                Our support team is available round-the-clock to help you with any queries.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
