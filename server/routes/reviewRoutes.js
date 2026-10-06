import express from "express";
import { getReviews, createReview } from "../controllers/reviewController.js";
import { protect } from "../middleware/auth.js";
const router = express.Router();
router.get("/:listingId", getReviews);
router.post("/:listingId", protect, createReview);
export default router;
