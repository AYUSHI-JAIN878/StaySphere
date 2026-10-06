import Listing from "../models/Listing.js";
import Booking from "../models/Booking.js";

export const getListings = async (req, res) => {
  try {
    const {
      search,
      location,
      minPrice,
      maxPrice,
      guests,
      type,
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        {
          title: new RegExp(search, "i"),
        },
        {
          location: new RegExp(search, "i"),
        },
      ];
    }

    if (location) {
      filter.location = new RegExp(location, "i");
    }

    if (type) {
      filter.propertyType = type;
    }

    if (guests) {
      filter.guests = {
        $gte: Number(guests),
      };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
    }

    if (minPrice) {
      filter.price.$gte = Number(minPrice);
    }

    if (maxPrice) {
      filter.price.$lte = Number(maxPrice);
    }

    const listings = await Listing.find(filter)
      .populate("host", "name avatar")
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (error) {
    console.error("GET LISTINGS ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

export const getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(
      req.params.id
    ).populate("host", "name avatar");

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    res.json(listing);
  } catch (error) {
    console.error("GET LISTING ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

export const createListing = async (req, res) => {
  try {
    const listing = await Listing.create({
      ...req.body,
      host: req.user._id,
    });

    res.status(201).json(listing);
  } catch (error) {
    console.error("CREATE LISTING ERROR:", error);

    res.status(400).json({
      message: error.message,
    });
  }
};

export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findOne({
      _id: req.params.id,
      host: req.user._id,
    });

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found or unauthorized",
      });
    }

    Object.assign(listing, req.body);

    await listing.save();

    res.json(listing);
  } catch (error) {
    console.error("UPDATE LISTING ERROR:", error);

    res.status(400).json({
      message: error.message,
    });
  }
};

export const deleteListing = async (req, res) => {
  try {
    const listing =
      await Listing.findOneAndDelete({
        _id: req.params.id,
        host: req.user._id,
      });

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found or unauthorized",
      });
    }

    res.json({
      message: "Listing deleted",
    });
  } catch (error) {
    console.error("DELETE LISTING ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

export const hostListings = async (req, res) => {
  try {
    const listings = await Listing.find({
      host: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.json(listings);
  } catch (error) {
    console.error("HOST LISTINGS ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};