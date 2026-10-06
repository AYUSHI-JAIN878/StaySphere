import Razorpay from "razorpay";
import crypto from "crypto";
import Booking from "../models/Booking.js";

export const createOrder = async (req, res) => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET)
    return res.status(503).json({ demo: true, message: "Payment keys are not configured. Demo booking can still be used." });
  const booking = await Booking.findOne({ _id: req.body.bookingId, guest: req.user._id });
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  const order = await razorpay.orders.create({ amount: booking.totalPrice * 100, currency: "INR", receipt: booking._id.toString() });
  res.json({ order, key: process.env.RAZORPAY_KEY_ID });
};

export const verifyPayment = async (req, res) => {
  const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
  if (expected !== razorpay_signature) return res.status(400).json({ message: "Invalid payment signature" });
  const booking = await Booking.findOneAndUpdate(
    { _id: bookingId, guest: req.user._id },
    { paymentStatus: "paid", paymentId: razorpay_payment_id },
    { new: true }
  );
  res.json(booking);
};
