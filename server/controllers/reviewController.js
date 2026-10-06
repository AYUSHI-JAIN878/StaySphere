import Review from "../models/Review.js";
import Listing from "../models/Listing.js";
import Booking from "../models/Booking.js";

export const getReviews = async (req, res) => {
  res.json(await Review.find({ listing: req.params.listingId }).populate("user", "name avatar").sort({ createdAt: -1 }));
};

export const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const listing = await Listing.findById(req.params.listingId);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    const hasStayed = await Booking.findOne({ guest: req.user._id, listing: listing._id, bookingStatus: "confirmed" });
    if (!hasStayed) return res.status(403).json({ message: "Only guests with a booking can review this property" });
    const review = await Review.create({ listing: listing._id, user: req.user._id, rating, comment });
    const stats = await Review.aggregate([{ $match: { listing: listing._id } }, { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } }]);
    listing.rating = Number(stats[0].avg.toFixed(1));
    listing.reviewCount = stats[0].count;
    await listing.save();
    res.status(201).json(await review.populate("user", "name avatar"));
  } catch (e) { res.status(400).json({ message: e.code === 11000 ? "You already reviewed this property" : e.message }); }
};
