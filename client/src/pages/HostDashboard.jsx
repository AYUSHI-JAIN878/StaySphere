import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import api from "../api";

// Default map location: India
const DEFAULT_LOCATION = [22.9734, 78.6569];

// Fallback image
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80";

// Leaflet marker fix
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Handles map clicks
function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([
        e.latlng.lat,
        e.latlng.lng,
      ]);
    },
  });

  return position ? (
    <Marker position={position} />
  ) : null;
}

// Moves map to selected location
function MapUpdater({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 14, {
        duration: 0.8,
      });
    }
  }, [position, map]);

  return null;
}

// Safely handle image URLs
const getImageUrl = (image) => {
  if (!image || typeof image !== "string") {
    return FALLBACK_IMAGE;
  }

  const cleanImage = image.trim();

  if (!cleanImage) {
    return FALLBACK_IMAGE;
  }

  // Existing full URLs stay exactly the same
  if (
    cleanImage.startsWith("http://") ||
    cleanImage.startsWith("https://")
  ) {
    return cleanImage;
  }

  // Relative backend image path
  const apiBase =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

  if (cleanImage.startsWith("/")) {
    return `${apiBase}${cleanImage}`;
  }

  return `${apiBase}/${cleanImage}`;
};

export default function HostDashboard() {
  const [items, setItems] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    price: 3000,
    propertyType: "Apartment",
    guests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    amenities: "WiFi, Kitchen",
    images: "",
  });

  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const [
        listingsResponse,
        bookingsResponse,
      ] = await Promise.all([
        api.get("/listings/host/mine"),
        api.get("/bookings/host"),
      ]);

      setItems(
        Array.isArray(listingsResponse.data)
          ? listingsResponse.data
          : []
      );

      setBookings(
        Array.isArray(bookingsResponse.data)
          ? bookingsResponse.data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load host dashboard:",
        error
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateForm = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const create = async (e) => {
    e.preventDefault();

    if (!position) {
      alert(
        "Please select your property location on the map."
      );
      return;
    }

    if (!form.location.trim()) {
      alert("Please enter the property location.");
      return;
    }

    try {
      setLoading(true);

      // Keep all existing image URLs
      const imageUrls = form.images
        .split(",")
        .map((image) => image.trim())
        .filter(Boolean);

      const amenities = form.amenities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      await api.post("/listings", {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),

        price: Number(form.price),

        propertyType: form.propertyType,

        guests: Math.min(
          6,
          Math.max(1, Number(form.guests))
        ),

        bedrooms: Number(form.bedrooms),

        beds: Number(form.beds),

        bathrooms: Number(form.bathrooms),

        amenities,

        // Existing image URLs are saved as an array
        images: imageUrls,

        // Map coordinates
        latitude: Number(position[0]),
        longitude: Number(position[1]),
      });

      setForm({
        title: "",
        description: "",
        location: "",
        price: 3000,
        propertyType: "Apartment",
        guests: 2,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        amenities: "WiFi, Kitchen",
        images: "",
      });

      setPosition(null);

      await load();

      alert("Property created successfully!");
    } catch (error) {
      console.error(
        "Failed to create listing:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to create listing. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const revenue = bookings.reduce(
    (sum, booking) =>
      sum + Number(booking.totalPrice || 0),
    0
  );

  return (
    <main className="container py-8 sm:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black">
            Host Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            Manage your stays, properties and
            reservations.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 my-7">
        <div className="card p-5">
          <p className="text-gray-500">
            Listings
          </p>

          <b className="text-3xl">
            {items.length}
          </b>
        </div>

        <div className="card p-5">
          <p className="text-gray-500">
            Bookings
          </p>

          <b className="text-3xl">
            {bookings.length}
          </b>
        </div>

        <div className="card p-5">
          <p className="text-gray-500">
            Estimated Revenue
          </p>

          <b className="text-3xl">
            ₹{revenue.toLocaleString("en-IN")}
          </b>
        </div>
      </div>

      {/* Main */}
      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-8">
        {/* Add Property */}
        <form
          onSubmit={create}
          className="card p-5 sm:p-6 space-y-4"
        >
          <div>
            <h2 className="text-xl font-bold">
              Add a Property
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Add your property details and select
              its exact location on the map.
            </p>
          </div>

          {/* Title */}
          <input
            className="input"
            placeholder="Property title"
            value={form.title}
            onChange={(e) =>
              updateForm(
                "title",
                e.target.value
              )
            }
            required
          />

          {/* Description */}
          <textarea
            className="input min-h-28 resize-none"
            placeholder="Property description"
            value={form.description}
            onChange={(e) =>
              updateForm(
                "description",
                e.target.value
              )
            }
            required
          />

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Property Location
            </label>

            <input
              className="input"
              placeholder="e.g. Gwalior, Madhya Pradesh"
              value={form.location}
              onChange={(e) =>
                updateForm(
                  "location",
                  e.target.value
                )
              }
              required
            />

            <p className="text-xs text-gray-500 mt-1">
              Enter the location name and then
              select the exact spot on the map.
            </p>
          </div>

          {/* Price */}
          <input
            className="input"
            type="number"
            min="1"
            placeholder="Price per night"
            value={form.price}
            onChange={(e) =>
              updateForm(
                "price",
                e.target.value
              )
            }
            required
          />

          {/* Property Type */}
          <select
            className="input"
            value={form.propertyType}
            onChange={(e) =>
              updateForm(
                "propertyType",
                e.target.value
              )
            }
          >
            {[
              "Apartment",
              "Villa",
              "Cabin",
              "House",
              "Hotel",
            ].map((type) => (
              <option
                key={type}
                value={type}
              >
                {type}
              </option>
            ))}
          </select>

          {/* Guests */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Maximum Guests
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  updateForm(
                    "guests",
                    Math.max(
                      1,
                      Number(form.guests) - 1
                    )
                  )
                }
                className="w-11 h-11 rounded-xl border text-xl font-bold hover:bg-gray-100 transition"
              >
                −
              </button>

              <div className="flex-1 h-11 rounded-xl border flex items-center justify-center font-semibold">
                {form.guests}{" "}
                {Number(form.guests) === 1
                  ? "Guest"
                  : "Guests"}
              </div>

              <button
                type="button"
                onClick={() =>
                  updateForm(
                    "guests",
                    Math.min(
                      6,
                      Number(form.guests) + 1
                    )
                  )
                }
                className="w-11 h-11 rounded-xl border text-xl font-bold hover:bg-gray-100 transition"
              >
                +
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Maximum capacity: 6 guests
            </p>
          </div>

          {/* Bedrooms */}
          <input
            className="input"
            type="number"
            min="1"
            placeholder="Bedrooms"
            value={form.bedrooms}
            onChange={(e) =>
              updateForm(
                "bedrooms",
                e.target.value
              )
            }
            required
          />

          {/* Beds */}
          <input
            className="input"
            type="number"
            min="1"
            placeholder="Beds"
            value={form.beds}
            onChange={(e) =>
              updateForm(
                "beds",
                e.target.value
              )
            }
            required
          />

          {/* Bathrooms */}
          <input
            className="input"
            type="number"
            min="1"
            placeholder="Bathrooms"
            value={form.bathrooms}
            onChange={(e) =>
              updateForm(
                "bathrooms",
                e.target.value
              )
            }
            required
          />

          {/* Amenities */}
          <input
            className="input"
            placeholder="Amenities e.g. WiFi, Kitchen"
            value={form.amenities}
            onChange={(e) =>
              updateForm(
                "amenities",
                e.target.value
              )
            }
          />

          {/* Images */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Property Images
            </label>

            <input
              className="input"
              placeholder="Paste image URLs, comma separated"
              value={form.images}
              onChange={(e) =>
                updateForm(
                  "images",
                  e.target.value
                )
              }
              required
            />

            <p className="text-xs text-gray-500 mt-1">
              Add multiple image URLs separated by commas.
              Existing image URLs will be saved as provided.
            </p>

            {/* Image Preview */}
            {form.images.trim() && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {form.images
                  .split(",")
                  .map((image) => image.trim())
                  .filter(Boolean)
                  .slice(0, 6)
                  .map((image, index) => (
                    <img
                      key={index}
                      src={getImageUrl(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg border"
                      onError={(e) => {
                        e.currentTarget.src =
                          FALLBACK_IMAGE;
                      }}
                    />
                  ))}
              </div>
            )}
          </div>

          {/* MAP */}
          <div className="pt-2">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-3">
              <div>
                <h3 className="font-bold text-lg">
                  Select Property Location
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Click anywhere on the map to place
                  your property pin.
                </p>
              </div>

              {position && (
                <button
                  type="button"
                  className="text-sm text-red-500 font-semibold hover:text-red-700"
                  onClick={() =>
                    setPosition(null)
                  }
                >
                  Clear Location
                </button>
              )}
            </div>

            <div className="h-[320px] sm:h-[360px] rounded-2xl overflow-hidden border shadow-sm">
              <MapContainer
                center={DEFAULT_LOCATION}
                zoom={5}
                scrollWheelZoom={true}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapUpdater
                  position={position}
                />

                <LocationPicker
                  position={position}
                  setPosition={setPosition}
                />
              </MapContainer>
            </div>

            {/* Coordinates */}
            {position ? (
              <div className="mt-3 rounded-xl bg-green-50 border border-green-200 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />

                  <p className="text-sm font-semibold text-green-700">
                    Location selected
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-700">
                  <p>
                    <strong>Latitude:</strong>{" "}
                    {position[0].toFixed(6)}
                  </p>

                  <p>
                    <strong>Longitude:</strong>{" "}
                    {position[1].toFixed(6)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-xl bg-red-50 border border-red-100 p-3">
                <p className="text-xs text-red-600">
                  Please click on the map to select
                  your property's exact location.
                </p>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? "Creating Listing..."
              : "Create Listing"}
          </button>
        </form>

        {/* My Properties */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">
                My Properties
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Your listed properties
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {items.length === 0 ? (
              <div className="card p-6 text-center text-gray-500">
                No properties added yet.
              </div>
            ) : (
              items.map((property) => {
                const hasCoordinates =
                  typeof property.latitude ===
                    "number" &&
                  typeof property.longitude ===
                    "number";

                const propertyImage =
                  Array.isArray(
                    property.images
                  ) &&
                  property.images.length > 0
                    ? getImageUrl(
                        property.images[0]
                      )
                    : FALLBACK_IMAGE;

                return (
                  <div
                    className="card p-4 flex gap-4"
                    key={property._id}
                  >
                    <img
                      src={propertyImage}
                      alt={
                        property.title ||
                        "Property"
                      }
                      className="w-24 h-20 object-cover rounded-xl flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src =
                          FALLBACK_IMAGE;
                      }}
                    />

                    <div className="min-w-0 flex-1">
                      <Link
                        className="font-bold hover:text-[#ff385c] transition"
                        to={`/listings/${property._id}`}
                      >
                        {property.title}
                      </Link>

                      <p className="text-gray-500 text-sm mt-1">
                        {property.location}
                      </p>

                      <p className="text-sm mt-1">
                        ₹
                        {Number(
                          property.price || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                        /night
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        Up to{" "}
                        {property.guests ||
                          1}{" "}
                        guests
                      </p>

                      {hasCoordinates ? (
                        <p className="text-xs text-green-600 mt-1 font-medium">
                          📍 Location added
                        </p>
                      ) : (
                        <p className="text-xs text-orange-500 mt-1">
                          Map location unavailable
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </main>
  );
}