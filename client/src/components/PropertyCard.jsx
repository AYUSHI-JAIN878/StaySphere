import { Link } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../api";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80";

const getImageUrl = (image) => {
  if (!image || typeof image !== "string") {
    return FALLBACK_IMAGE;
  }

  const cleanImage = image.trim();

  if (!cleanImage) {
    return FALLBACK_IMAGE;
  }

  // Full URL
  if (
    cleanImage.startsWith("http://") ||
    cleanImage.startsWith("https://")
  ) {
    return cleanImage;
  }

  // Relative URL from backend
  if (cleanImage.startsWith("/")) {
    return `${API_BASE_URL}${cleanImage}`;
  }

  return `${API_BASE_URL}/${cleanImage}`;
};

export default function PropertyCard({ listing, onSaved }) {
  const { user } = useAuth();

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const checkWishlist = async () => {
      if (!user || !listing?._id) {
        setSaved(false);
        return;
      }

      try {
        const response = await api.get("/users/wishlist");

        const wishlist = response.data?.wishlist || [];

        const exists = wishlist.some(
          (item) =>
            item?._id?.toString() === listing._id.toString()
        );

        setSaved(exists);
      } catch (error) {
        console.error("Failed to check wishlist:", error);
      }
    };

    checkWishlist();
  }, [user, listing?._id]);

  useEffect(() => {
    setImageError(false);
  }, [listing?.images]);

  const save = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || saving) {
      return;
    }

    try {
      setSaving(true);

      const response = await api.patch(
        `/users/wishlist/${listing._id}`
      );

      if (response.data?.success) {
        setSaved(Boolean(response.data.added));
      }

      onSaved?.();
    } catch (error) {
      console.error(
        "Failed to update wishlist:",
        error?.response?.data || error
      );
    } finally {
      setSaving(false);
    }
  };

  const image =
    !imageError && listing?.images?.length
      ? getImageUrl(listing.images[0])
      : FALLBACK_IMAGE;

  return (
    <Link
      to={`/listings/${listing._id}`}
      className="property-card-link"
    >
      <article className="property-card">
        {/* IMAGE */}
        <div className="property-image-wrapper">
          <img
            src={image}
            alt={listing?.title || "Property"}
            className="property-image"
            loading="lazy"
            onError={() => setImageError(true)}
          />

          {/* WISHLIST */}
          <button
            type="button"
            onClick={save}
            disabled={saving}
            aria-label={
              saved
                ? "Remove from wishlist"
                : "Save to wishlist"
            }
            className="wishlist-button"
          >
            <Heart
              size={19}
              fill={saved ? "#ff385c" : "none"}
              color={saved ? "#ff385c" : "currentColor"}
            />
          </button>
        </div>

        {/* CONTENT */}
        <div className="property-content">
          <div className="property-title-row">
            <h3 className="property-title">
              {listing?.title || "Untitled stay"}
            </h3>

            <span className="property-rating">
              <Star
                size={15}
                fill="currentColor"
              />

              {listing?.rating ?? "New"}
            </span>
          </div>

          <p className="property-location">
            {listing?.location || "Location unavailable"}
          </p>

          <p className="property-info">
            {listing?.guests ?? 0} guests •{" "}
            {listing?.bedrooms ?? 0} bedrooms •{" "}
            {listing?.beds ?? 0} beds
          </p>

          <p className="property-price">
            <strong>
              ₹
              {Number(
                listing?.price || 0
              ).toLocaleString("en-IN")}
            </strong>{" "}
            <span>night</span>
          </p>
        </div>
      </article>
    </Link>
  );
}