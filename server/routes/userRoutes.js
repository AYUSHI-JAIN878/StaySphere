import express from "express";

import {
  toggleWishlist,
  getWishlist,
} from "../controllers/userController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

// Add / Remove wishlist
router.patch(
  "/wishlist/:listingId",
  protect,
  toggleWishlist
);

// Get wishlist
router.get(
  "/wishlist",
  protect,
  getWishlist
);

export default router;