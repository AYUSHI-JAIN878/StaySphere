import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import SearchBar from "../components/SearchBar";
import PropertyCard from "../components/PropertyCard";
import api from "../api";

const categories = [
  "Beach",
  "Mountains",
  "City",
  "Cabins",
  "Pool",
  "Heritage",
];

export default function Home() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadListings = async () => {
      try {
        const response = await api.get("/listings");

        setItems(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load popular stays:",
          error
        );

        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, []);

  const handleSearch = (query) => {
    navigate(
      `/listings?search=${encodeURIComponent(query)}`
    );
  };

  return (
    <>
      {/* ================= HERO SECTION ================= */}
      <section className="bg-gradient-to-br from-rose-50 via-white to-orange-50 py-20">
        <div className="container">
          <div className="max-w-2xl">
            <p className="font-bold text-[#ff385c] mb-3">
              STAY SOMEWHERE YOU'LL LOVE
            </p>

            <h1 className="text-5xl md:text-6xl font-black tracking-tight">
              Find a stay that feels like home.
            </h1>

            <p className="text-gray-600 text-lg mt-5 mb-8">
              Discover beautiful stays, book memorable
              trips, and explore destinations across India.
            </p>

            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* ================= POPULAR STAYS ================= */}
      <section className="container py-10">
        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-4">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() =>
                navigate(
                  `/listings?search=${encodeURIComponent(
                    category
                  )}`
                )
              }
              className="border rounded-full px-5 py-2 whitespace-nowrap hover:bg-gray-50 transition"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Popular Stays Heading */}
        <div className="flex items-end justify-between mt-7 mb-5">
          <div>
            <h2 className="text-2xl font-black">
              Popular stays
            </h2>

            <p className="text-gray-500 mt-1">
              Handpicked places for your next trip
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/listings")}
            className="font-bold underline hover:text-[#ff385c] transition"
          >
            View all
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-80 rounded-2xl bg-gray-100 animate-pulse"
                />
              )
            )}
          </div>
        )}

        {/* Properties */}
        {!loading && items.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.slice(0, 8).map((listing) => (
              <PropertyCard
                key={listing._id}
                listing={listing}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <div className="border rounded-2xl py-14 text-center">
            <h3 className="text-xl font-bold">
              No stays available yet
            </h3>

            <p className="text-gray-500 mt-2">
              Add a property from the Host Dashboard
              to see it here.
            </p>

            <button
              type="button"
              onClick={() => navigate("/listings")}
              className="btn btn-primary mt-5"
            >
              Explore stays
            </button>
          </div>
        )}
      </section>
    </>
  );
}
