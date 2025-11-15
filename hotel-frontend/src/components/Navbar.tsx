import React from "react";
import { useAuth } from "../context/AuthContext";

const Navbar: React.FC = () => {
  const { user, token } = useAuth();

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <div className="font-bold">Hotel Booking</div>

      <div>
        {token && user ? (
          <span>Welcome, {user.username}</span>
        ) : (
          <span>Guest</span>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
