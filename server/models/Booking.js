import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  guest: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, required: true },
  nights: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  bookingStatus: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" },
  paymentId: String
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);
