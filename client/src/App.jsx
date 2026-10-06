import { Routes, Route, useLocation } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Listings from "./pages/Listings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PropertyDetails from "./pages/PropertyDetails";
import BookingSuccess from "./pages/BookingSuccess";
import Bookings from "./pages/Bookings";
import HostDashboard from "./pages/HostDashboard";
import Wishlist from "./pages/Wishlist";

function AppContent() {
  const location = useLocation();

  // Footer sirf Home page par show hoga
  const showFooter = location.pathname === "/";

  return (
    <>
      <Navbar />

      <Routes>
        {/* =========================
            PUBLIC ROUTES
        ========================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* =========================
            PROTECTED ROUTES
        ========================= */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/listings"
          element={
            <ProtectedRoute>
              <Listings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/listings/:id"
          element={
            <ProtectedRoute>
              <PropertyDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/booking-success/:id"
          element={
            <ProtectedRoute>
              <BookingSuccess />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <Bookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />

        {/* =========================
            HOST ONLY
        ========================= */}
        <Route
          path="/host"
          element={
            <ProtectedRoute role="host">
              <HostDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* =========================
          FOOTER - HOME PAGE ONLY
      ========================= */}
      {showFooter && (
        <footer className="mt-16 bg-[#fff1f3] border-t border-[#ffd6dc]">
          <div className="container py-10">

            <div className="flex flex-col md:flex-row items-center justify-between gap-6">

              {/* Brand Section */}
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-[#ff385c]">
                  StaySphere
                </h3>

                <p className="mt-2 text-sm text-[#6b4f55] max-w-md leading-6">
                  Find a place that feels like home.
                  Discover comfortable stays and make
                  every journey memorable.
                </p>
              </div>

              {/* Right Section */}
              <div className="text-center md:text-right">
                <p className="text-sm font-medium text-[#7a555d]">
                  Your stay. Your space. Your experience.
                </p>

                <p className="mt-2 text-xs text-[#9b747b]">
                  © 2026 StaySphere. All rights reserved.
                </p>
              </div>

            </div>

          </div>
        </footer>
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}