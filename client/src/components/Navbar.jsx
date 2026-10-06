import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  UserCircle,
  Home,
  Menu,
  X,
  CalendarCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    nav("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b">
      <div className="container min-h-20 flex items-center justify-between gap-5">

        {/* ================= LOGO ================= */}
        <Link
          to={user ? "/" : "/login"}
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-2 text-2xl font-black text-[#ff385c]"
        >
          <Home size={25} />
          <span>StaySphere</span>
        </Link>

        {/* ================= DESKTOP NAVIGATION ================= */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
          {user && (
            <>
              <Link
                to="/"
                className="hover:text-[#ff385c] transition"
              >
                Home
              </Link>

              <Link
                to="/listings"
                className="hover:text-[#ff385c] transition"
              >
                Explore stays
              </Link>

              {/* MY BOOKINGS */}
              <Link
                to="/bookings"
                className="flex items-center gap-1.5 hover:text-[#ff385c] transition"
              >
                <CalendarCheck size={17} />
                My Bookings
              </Link>

              {user.role === "host" && (
                <Link
                  to="/host"
                  className="hover:text-[#ff385c] transition"
                >
                  Host dashboard
                </Link>
              )}
            </>
          )}
        </nav>

        {/* ================= RIGHT SECTION ================= */}
        <div className="flex items-center gap-3">

          {/* Wishlist */}
          {user && (
            <Link
              to="/wishlist"
              className="p-2 rounded-full hover:bg-gray-100 transition"
              aria-label="Wishlist"
            >
              <Heart size={20} />
            </Link>
          )}

          {user ? (
            <>
              {/* User Name */}
              <span className="hidden sm:inline text-sm font-medium">
                Hi, {user.name}
              </span>

              {/* Logout */}
              <button
                className="btn border rounded-lg px-4 py-2 hover:bg-gray-50"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              className="btn btn-dark"
              to="/login"
            >
              <UserCircle size={17} />
              Login
            </Link>
          )}

          {/* Mobile Menu Button */}
          {user && (
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X size={23} />
              ) : (
                <Menu size={23} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {user && menuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="container py-4 flex flex-col gap-1">

            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="px-4 py-3 rounded-lg hover:bg-gray-100 font-medium"
            >
              Home
            </Link>

            <Link
              to="/listings"
              onClick={() => setMenuOpen(false)}
              className="px-4 py-3 rounded-lg hover:bg-gray-100 font-medium"
            >
              Explore stays
            </Link>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              onClick={() => setMenuOpen(false)}
              className="px-4 py-3 rounded-lg hover:bg-gray-100 font-medium"
            >
              Wishlist
            </Link>

            {/* MY BOOKINGS */}
            <Link
              to="/bookings"
              onClick={() => setMenuOpen(false)}
              className="px-4 py-3 rounded-lg hover:bg-gray-100 font-medium flex items-center gap-2"
            >
              <CalendarCheck size={18} />
              My Bookings
            </Link>

            {/* Host Dashboard */}
            {user.role === "host" && (
              <Link
                to="/host"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 rounded-lg hover:bg-gray-100 font-medium"
              >
                Host Dashboard
              </Link>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="text-left px-4 py-3 rounded-lg hover:bg-gray-100 font-medium text-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}