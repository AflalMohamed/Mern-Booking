import React from "react";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  hideAuthLinks?: boolean; // optional prop
}

const Header: React.FC<HeaderProps> = ({ hideAuthLinks }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Hotel Booking</h1>

      <div className="flex gap-4">
        {!hideAuthLinks && !user && (
          <>
            <a href="/login" className="text-blue-600">
              Login
            </a>
            <a href="/register" className="text-blue-600">
              Register
            </a>
          </>
        )}

        {user && (
          <>
            <span>Welcome, {user.username}</span>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
