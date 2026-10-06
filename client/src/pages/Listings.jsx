import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api";
import PropertyCard from "../components/PropertyCard";

export default function Listings() {
  const [params] = useSearchParams();

  const [items, setItems] = useState([]);

  const [filters, setFilters] = useState({
    location: params.get("search") || "",
    minPrice: "",
    maxPrice: "",
    type: "",
  });

  const loadListings = async () => {
    try {
      const response = await api.get("/listings", {
        params: filters,
      });

      setItems(response.data);
    } catch (error) {
      console.error("Failed to load listings:", error);
      setItems([]);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <main className="container py-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black">
          Explore stays
        </h1>

        <p className="text-gray-500 mt-1">
          Find the perfect place for your next stay.
        </p>
      </div>

      {/* Filters */}
      <div className="card p-4 mt-5 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <input
          className="input"
          type="text"
          name="location"
          placeholder="Location"
          value={filters.location}
          onChange={handleChange}
        />

        <input
          className="input"
          type="number"
          name="minPrice"
          placeholder="Min price"
          value={filters.minPrice}
          onChange={handleChange}
        />

        <input
          className="input"
          type="number"
          name="maxPrice"
          placeholder="Max price"
          value={filters.maxPrice}
          onChange={handleChange}
        />

        <select
          className="input"
          name="type"
          value={filters.type}
          onChange={handleChange}
        >
          <option value="">All types</option>
          <option value="Villa">Villa</option>
          <option value="Apartment">Apartment</option>
          <option value="Cabin">Cabin</option>
          <option value="House">House</option>
          <option value="Hotel">Hotel</option>
        </select>

        <button
          className="btn btn-primary"
          onClick={loadListings}
        >
          Apply filters
        </button>
      </div>

      {/* Results */}
      <p className="text-gray-500 my-6">
        {items.length} stays found
      </p>

      {/* Listing Cards */}
      {items.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((listing) => (
            <PropertyCard
              key={listing._id}
              listing={listing}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold">
            No stays found
          </h2>

          <p className="text-gray-500 mt-2">
            Try changing your search filters.
          </p>
        </div>
      )}
    </main>
  );
}