import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Star,
  MapPin,
  Heart,
  Navigation,
} from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import L from "leaflet";
import api from "../api";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1400&q=80";

const getImageUrl = (image) => {
  if (!image || typeof image !== "string") {
    return FALLBACK_IMAGE;
  }

  const cleanImage = image.trim();

  if (!cleanImage) {
    return FALLBACK_IMAGE;
  }

  // Full image URL
  if (
    cleanImage.startsWith("http://") ||
    cleanImage.startsWith("https://")
  ) {
    return cleanImage;
  }

  const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

  // Relative backend path
  if (cleanImage.startsWith("/")) {
    return `${API_BASE_URL}${cleanImage}`;
  }

  return `${API_BASE_URL}/${cleanImage}`;
};

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [booking, setBooking] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
  });

  const [bookingLoading, setBookingLoading] =
    useState(false);

  const [bookingError, setBookingError] =
    useState("");

  // Load property
  useEffect(() => {
    const loadProperty = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/listings/${id}`
        );

        setItem(response.data);
      } catch (err) {
        console.error(
          "Failed to load property:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Unable to load this property."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProperty();
    }
  }, [id]);

  // Load reviews
  useEffect(() => {
    const loadReviews = async () => {
      try {
        const response = await api.get(
          `/reviews/${id}`
        );

        setReviews(
          Array.isArray(response.data)
            ? response.data
            : response.data?.reviews || []
        );
      } catch (err) {
        console.error(
          "Failed to load reviews:",
          err
        );

        setReviews([]);
      }
    };

    if (id) {
      loadReviews();
    }
  }, [id]);

  // Check wishlist
  useEffect(() => {
    const checkWishlist = async () => {
      try {
        const response = await api.get(
          "/users/wishlist"
        );

        const wishlist =
          response.data?.wishlist || [];

        const exists = wishlist.some(
          (wishlistItem) =>
            wishlistItem?._id?.toString() ===
            id?.toString()
        );

        setSaved(exists);
      } catch (err) {
        setSaved(false);
      }
    };

    if (id) {
      checkWishlist();
    }
  }, [id]);

  // Wishlist
  const toggleWishlist = async () => {
    if (saving) return;

    try {
      setSaving(true);

      const response = await api.patch(
        `/users/wishlist/${id}`
      );

      if (response.data?.success) {
        setSaved(
          Boolean(response.data.added)
        );
      }
    } catch (err) {
      console.error(
        "Wishlist update failed:",
        err?.response?.data || err
      );
    } finally {
      setSaving(false);
    }
  };

  // Booking form
  const handleBookingChange = (e) => {
    const { name, value } = e.target;

    setBooking((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Booking
  const handleBooking = async (e) => {
    e.preventDefault();

    setBookingError("");

    if (
      !booking.checkIn ||
      !booking.checkOut
    ) {
      setBookingError(
        "Please select check-in and check-out dates."
      );

      return;
    }

    if (
      new Date(booking.checkOut) <=
      new Date(booking.checkIn)
    ) {
      setBookingError(
        "Check-out date must be after check-in date."
      );

      return;
    }

    if (
      Number(booking.guests) < 1 ||
      Number(booking.guests) >
        Number(item?.guests || 1)
    ) {
      setBookingError(
        `Maximum ${
          item?.guests || 1
        } guests allowed.`
      );

      return;
    }

    try {
      setBookingLoading(true);

      const response = await api.post(
        "/bookings",
        {
          listingId: item._id,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          guests: Number(booking.guests),
        }
      );

      const bookingId =
        response.data?._id ||
        response.data?.booking?._id ||
        response.data?.id;

      if (bookingId) {
        navigate(
          `/booking-success/${bookingId}`
        );
      } else {
        navigate("/bookings");
      }
    } catch (err) {
      console.error(
        "Booking failed:",
        err?.response?.data || err
      );

      setBookingError(
        err?.response?.data?.message ||
          "Booking failed. Please try again."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  // Google Maps directions
  const openDirections = () => {
    if (
      typeof item?.latitude !== "number" ||
      typeof item?.longitude !== "number"
    ) {
      return;
    }

    const url =
      `https://www.google.com/maps/dir/?api=1` +
      `&destination=${item.latitude},${item.longitude}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // Loading
  if (loading) {
    return (
      <main className="container py-16">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
        </div>
      </main>
    );
  }

  // Error
  if (error || !item) {
    return (
      <main className="container py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Property not found
          </h1>

          <p className="text-gray-500 mt-2">
            {error ||
              "This property is unavailable."}
          </p>

          <button
            onClick={() =>
              navigate("/listings")
            }
            className="btn btn-primary mt-6"
          >
            Back to listings
          </button>
        </div>
      </main>
    );
  }

  /*
    IMPORTANT:
    Keep all existing images from MongoDB.
    Only use fallback if there are no images.
  */
  const images =
    Array.isArray(item.images) &&
    item.images.length > 0
      ? item.images
          .map((image) =>
            typeof image === "string"
              ? image.trim()
              : ""
          )
          .filter(Boolean)
      : [];

  const displayImages =
    images.length > 0
      ? images
      : [FALLBACK_IMAGE];

  const hasMapLocation =
    typeof item.latitude === "number" &&
    typeof item.longitude === "number";

  return (
    <main className="container py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black">
            {item.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-gray-600">
            <span className="flex items-center gap-1">
              <MapPin size={18} />
              {item.location}
            </span>

            <span className="flex items-center gap-1">
              <Star
                size={17}
                fill="currentColor"
              />
              {item.rating || "New"}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleWishlist}
          disabled={saving}
          className="flex items-center justify-center gap-2 border rounded-full px-5 py-2.5 hover:bg-gray-50 transition"
        >
          <Heart
            size={19}
            fill={
              saved ? "#ff385c" : "none"
            }
            color={
              saved
                ? "#ff385c"
                : "currentColor"
            }
          />

          {saved ? "Saved" : "Save"}
        </button>
      </div>

      {/* Images */}
      <div className="grid md:grid-cols-4 gap-3 mt-6 h-auto md:h-[420px]">
        {displayImages.map(
          (image, index) => {
            const imageUrl =
              getImageUrl(image);

            return (
              <img
                key={`${image}-${index}`}
                src={imageUrl}
                alt={`${item.title} ${
                  index + 1
                }`}
                className={`w-full h-64 md:h-full object-cover rounded-xl ${
                  index === 0
                    ? "md:col-span-2 md:row-span-2"
                    : ""
                }`}
                onError={(e) => {
                  if (
                    e.currentTarget.src !==
                    FALLBACK_IMAGE
                  ) {
                    e.currentTarget.src =
                      FALLBACK_IMAGE;
                  }
                }}
              />
            );
          }
        )}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8 mt-10">
        {/* Left */}
        <div className="lg:col-span-2">
          {/* Property info */}
          <div className="border-b pb-6">
            <h2 className="text-2xl font-bold">
              {item.propertyType ||
                "Stay"}{" "}
              hosted by{" "}
              {item.host?.name || "Host"}
            </h2>

            <p className="text-gray-600 mt-2">
              {item.guests || 0} guests ·{" "}
              {item.bedrooms || 0} bedrooms ·{" "}
              {item.beds || 0} beds ·{" "}
              {item.bathrooms || 0} bathrooms
            </p>
          </div>

          {/* Description */}
          <div className="py-7 border-b">
            <h2 className="text-xl font-bold mb-3">
              About this place
            </h2>

            <p className="text-gray-600 leading-7 whitespace-pre-line">
              {item.description}
            </p>
          </div>

          {/* Amenities */}
          {Array.isArray(
            item.amenities
          ) &&
            item.amenities.length > 0 && (
              <div className="py-7 border-b">
                <h2 className="text-xl font-bold mb-4">
                  What this place offers
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  {item.amenities.map(
                    (
                      amenity,
                      index
                    ) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 text-gray-700"
                      >
                        <span className="w-2 h-2 rounded-full bg-black" />

                        {amenity}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          {/* Location */}
          <div className="py-7 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-bold">
                  Where you'll stay
                </h2>

                <p className="text-gray-500 mt-1">
                  {item.location}
                  {item.country
                    ? `, ${item.country}`
                    : ""}
                </p>
              </div>

              {hasMapLocation && (
                <button
                  type="button"
                  onClick={
                    openDirections
                  }
                  className="flex items-center justify-center gap-2 border rounded-lg px-4 py-2 hover:bg-gray-50 transition"
                >
                  <Navigation
                    size={17}
                  />
                  Get directions
                </button>
              )}
            </div>

            {hasMapLocation ? (
              <>
                <div className="h-[380px] rounded-2xl overflow-hidden border">
                  <MapContainer
                    center={[
                      item.latitude,
                      item.longitude,
                    ]}
                    zoom={14}
                    scrollWheelZoom={true}
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <Marker
                      position={[
                        item.latitude,
                        item.longitude,
                      ]}
                    >
                      <Popup>
                        <strong>
                          {item.title}
                        </strong>

                        <br />

                        {item.location}
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Coordinates:{" "}
                  {item.latitude.toFixed(
                    6
                  )}
                  ,{" "}
                  {item.longitude.toFixed(
                    6
                  )}
                </p>
              </>
            ) : (
              <div className="h-48 rounded-2xl bg-gray-100 flex flex-col items-center justify-center text-gray-500">
                <MapPin
                  size={30}
                  className="mb-2"
                />

                <p>
                  Map location is not
                  available for this
                  property.
                </p>
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="py-7">
            <div className="flex items-center gap-2 mb-5">
              <Star
                size={20}
                fill="currentColor"
              />

              <h2 className="text-xl font-bold">
                {item.rating || "New"}
              </h2>

              <span className="text-gray-500">
                · {reviews.length} reviews
              </span>
            </div>

            {reviews.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {reviews.map(
                  (review) => (
                    <div
                      key={review._id}
                      className="border rounded-xl p-5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">
                            {review
                              .user
                              ?.name ||
                              review.userName ||
                              "Guest"}
                          </p>

                          <p className="text-sm text-gray-500">
                            {review.createdAt
                              ? new Date(
                                  review.createdAt
                                ).toLocaleDateString(
                                  "en-IN"
                                )
                              : ""}
                          </p>
                        </div>

                        <span className="flex items-center gap-1">
                          <Star
                            size={15}
                            fill="currentColor"
                          />

                          {review.rating ||
                            5}
                        </span>
                      </div>

                      <p className="text-gray-600 mt-4">
                        {review.comment}
                      </p>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-gray-500">
                No reviews yet.
              </p>
            )}
          </div>
        </div>

        {/* Booking Card */}
        <div className="lg:col-span-1">
          <div className="border rounded-2xl p-6 shadow-sm sticky top-24 bg-white">
            <div className="flex items-end justify-between mb-5">
              <div>
                <span className="text-2xl font-bold">
                  ₹
                  {Number(
                    item.price || 0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </span>

                <span className="text-gray-500">
                  {" "}
                  / night
                </span>
              </div>

              <div className="flex items-center gap-1 text-sm">
                <Star
                  size={15}
                  fill="currentColor"
                />

                {item.rating || "New"}
              </div>
            </div>

            <form
              onSubmit={handleBooking}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Check-in
                </label>

                <input
                  className="input w-full"
                  type="date"
                  name="checkIn"
                  value={
                    booking.checkIn
                  }
                  onChange={
                    handleBookingChange
                  }
                  min={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Check-out
                </label>

                <input
                  className="input w-full"
                  type="date"
                  name="checkOut"
                  value={
                    booking.checkOut
                  }
                  onChange={
                    handleBookingChange
                  }
                  min={
                    booking.checkIn ||
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Guests
                </label>

                <input
                  className="input w-full"
                  type="number"
                  name="guests"
                  min="1"
                  max={
                    item.guests || 1
                  }
                  value={
                    booking.guests
                  }
                  onChange={
                    handleBookingChange
                  }
                  required
                />
              </div>

              {bookingError && (
                <div className="bg-red-50 text-red-600 rounded-lg p-3 text-sm">
                  {bookingError}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  bookingLoading
                }
                className="btn btn-primary w-full"
              >
                {bookingLoading
                  ? "Processing..."
                  : "Reserve"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-4">
              You won't be charged yet
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}