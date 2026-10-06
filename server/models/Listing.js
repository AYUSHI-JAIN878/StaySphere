import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
      index: true,
    },

    country: {
      type: String,
      default: "India",
    },

    // 🗺️ Map coordinates
    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    propertyType: {
      type: String,
      enum: ["Villa", "Apartment", "Cabin", "House", "Hotel"],
      default: "Apartment",
    },

    guests: {
      type: Number,
      default: 2,
    },

    bedrooms: {
      type: Number,
      default: 1,
    },

    beds: {
      type: Number,
      default: 1,
    },

    bathrooms: {
      type: Number,
      default: 1,
    },

    amenities: [String],

    images: [String],

    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rating: {
      type: Number,
      default: 0,
    },

    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Listing", listingSchema);