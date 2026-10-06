import Booking from "../models/Booking.js";
import Listing from "../models/Listing.js";

const daysBetween = (a, b) => Math.ceil((new Date(b) - new Date(a)) / 86400000);

export const createBooking = async (req, res) => {
  try {
    const { listingId, checkIn, checkOut, guests } = req.body;
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    const nights = daysBetween(checkIn, checkOut);
    if (nights <= 0) return res.status(400).json({ message: "Check-out must be after check-in" });
    if (Number(guests) > listing.guests) return res.status(400).json({ message: "Guest limit exceeded" });

    const conflict = await Booking.findOne({
      listing: listingId, bookingStatus: "confirmed",
      checkIn: { $lt: new Date(checkOut) }, checkOut: { $gt: new Date(checkIn) }
    });
    if (conflict) return res.status(409).json({ message: "Property is unavailable for these dates" });

    const totalPrice = nights * listing.price + 1000 + Math.round(nights * listing.price * 0.1);
    const booking = await Booking.create({
      guest: req.user._id, listing: listingId, checkIn, checkOut,
      guests, nights, totalPrice
    });
    res.status(201).json(await booking.populate("listing", "title location images price"));
  } catch (e) { res.status(400).json({ message: e.message }); }
};

export const myBookings = async (req, res) => {
  res.json(await Booking.find({ guest: req.user._id }).populate("listing", "title location images price").sort({ createdAt: -1 }));
};

export const hostBookings = async (req, res) => {
  const listings = await Listing.find({ host: req.user._id }).select("_id");
  res.json(await Booking.find({ listing: { $in: listings } }).populate("guest", "name email").populate("listing", "title location").sort({ createdAt: -1 }));
};

export const cancelBooking = async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, guest: req.user._id });
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  booking.bookingStatus = "cancelled";
  await booking.save();
  res.json(booking);
};
