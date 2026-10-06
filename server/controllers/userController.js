import User from "../models/User.js";
import Listing from "../models/Listing.js";

// ===============================
// TOGGLE WISHLIST
// ===============================
export const toggleWishlist = async (req, res) => {
  try {
    const { listingId } = req.params;

    if (!listingId) {
      return res.status(400).json({
        message: "Listing ID is required",
      });
    }

    // Check whether listing exists
    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    // Logged-in user comes from protect middleware
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // Make sure wishlist exists
    if (!Array.isArray(user.wishlist)) {
      user.wishlist = [];
    }

    const index = user.wishlist.findIndex(
      (id) => id.toString() === listingId.toString()
    );

    let added;

    if (index === -1) {
      // ADD
      user.wishlist.push(listing._id);
      added = true;
    } else {
      // REMOVE
      user.wishlist.splice(index, 1);
      added = false;
    }

    await user.save();

    // Get updated wishlist with listing details
    const updatedUser = await User.findById(req.user._id)
      .select("-password")
      .populate("wishlist");

    return res.status(200).json({
      success: true,
      added,
      message: added
        ? "Added to wishlist"
        : "Removed from wishlist",
      wishlist: updatedUser.wishlist,
    });
  } catch (error) {
    console.error("TOGGLE WISHLIST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update wishlist",
      error: error.message,
    });
  }
};

// ===============================
// GET WISHLIST
// ===============================
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("wishlist");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      wishlist: user.wishlist || [],
    });
  } catch (error) {
    console.error("GET WISHLIST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load wishlist",
      error: error.message,
    });
  }
};