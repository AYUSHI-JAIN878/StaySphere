import express from "express";
import { createBooking, myBookings, hostBookings, cancelBooking } from "../controllers/bookingController.js";
import { protect, hostOnly } from "../middleware/auth.js";
const router = express.Router();
router.post("/", protect, createBooking);
router.get("/mine", protect, myBookings);
router.get("/host", protect, hostOnly, hostBookings);
router.patch("/:id/cancel", protect, cancelBooking);
export default router;
