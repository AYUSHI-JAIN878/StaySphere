import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Users, IndianRupee } from "lucide-react";
import api from "../api";

export default function Bookings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get("/bookings/mine");
        setItems(response.data || []);
      } catch (error) {
        console.error("Failed to load bookings:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return (
    <main className="container py-10">
      {/* ================= HEADER ================= */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black">
          My Bookings
        </h1>

        <p className="text-gray-500 mt-2">
          View and manage all your upcoming and previous stays.
        </p>
      </div>

      {/* ================= LOADING ================= */}
      {loading && (
        <div className="py-16 text-center">
          <p className="text-gray-500">Loading your bookings...</p>
        </div>
      )}

      {/* ================= BOOKINGS ================= */}
      {!loading && items.length > 0 && (
        <div className="space-y-5">
          {items.map((booking) => {
            const listing = booking.listing;

            const image =
              listing?.images?.[0] ||
              "https://images.unsplash.com/photo-1564013799919-ab600027ffc6";

            return (
              <div
                key={booking._id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row">

                  {/* ================= IMAGE ================= */}
                  <div className="w-full md:w-64 h-52 md:h-auto flex-shrink-0">
                    <img
                      src={image}
                      alt={listing?.title || "Property"}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* ================= DETAILS ================= */}
                  <div className="flex-1 p-5">

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                      {/* Property */}
                      <div>
                        <Link
                          to={`/listings/${listing?._id}`}
                          className="text-xl font-bold hover:text-[#ff385c] transition"
                        >
                          {listing?.title || "Untitled stay"}
                        </Link>

                        <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-2">
                          <MapPin size={16} />
                          <span>
                            {listing?.location || "Location unavailable"}
                          </span>
                        </div>
                      </div>

                      {/* Status */}
                      <span
                        className={`w-fit px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.bookingStatus === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : booking.bookingStatus === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {booking.bookingStatus || "Pending"}
                      </span>
                    </div>

                    {/* ================= BOOKING INFO ================= */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">

                      {/* Check in */}
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-100">
                          <CalendarDays size={18} />
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Check-in
                          </p>
                          <p className="font-semibold">
                            {booking.checkIn
                              ? new Date(
                                  booking.checkIn
                                ).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "-"}
                          </p>
                        </div>
                      </div>

                      {/* Check out */}
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-100">
                          <CalendarDays size={18} />
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Check-out
                          </p>
                          <p className="font-semibold">
                            {booking.checkOut
                              ? new Date(
                                  booking.checkOut
                                ).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "-"}
                          </p>
                        </div>
                      </div>

                      {/* Guests */}
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-100">
                          <Users size={18} />
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Guests
                          </p>
                          <p className="font-semibold">
                            {booking.guests ?? listing?.guests ?? 1}
                          </p>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-100">
                          <IndianRupee size={18} />
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Total price
                          </p>

                          <p className="font-bold text-lg">
                            ₹
                            {Number(
                              booking.totalPrice || 0
                            ).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ================= VIEW PROPERTY ================= */}
                    {listing?._id && (
                      <div className="mt-6">
                        <Link
                          to={`/listings/${listing._id}`}
                          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#ff385c] text-white font-semibold hover:bg-[#e93150] transition"
                        >
                          View Property
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= NO BOOKINGS ================= */}
      {!loading && items.length === 0 && (
        <div className="border border-dashed border-gray-300 rounded-2xl py-16 px-6 text-center">
          <CalendarDays
            size={45}
            className="mx-auto text-gray-400 mb-4"
          />

          <h2 className="text-xl font-bold">
            No bookings yet
          </h2>

          <p className="text-gray-500 mt-2">
            You haven't booked any stays yet.
          </p>

          <Link
            to="/listings"
            className="inline-flex mt-6 px-5 py-2.5 rounded-xl bg-[#ff385c] text-white font-semibold hover:bg-[#e93150] transition"
          >
            Explore Stays
          </Link>
        </div>
      )}
    </main>
  );
}