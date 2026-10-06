import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "./models/User.js";
import Listing from "./models/Listing.js";

dotenv.config();

const image = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`;

const data = [
  [
    "Luxury Beach Villa",
    "Goa",
    4500,
    "Villa",
    "photo-1602002418082-a4443e081dd1",
    ["WiFi", "Pool", "Kitchen", "Air conditioning", "Parking"],
    15.4909,
    73.8278,
  ],

  [
    "Mountain View Cottage",
    "Manali",
    3200,
    "Cabin",
    "photo-1449158743715-0a90ebb6d2d8",
    ["WiFi", "Kitchen", "Heating", "Mountain view"],
    32.2396,
    77.1887,
  ],

  [
    "Modern City Apartment",
    "Mumbai",
    3800,
    "Apartment",
    "photo-1522708323590-d24dbb6b0267",
    ["WiFi", "Kitchen", "Workspace", "Air conditioning"],
    19.076,
    72.8777,
  ],

  [
    "Poolside Tropical Villa",
    "Goa",
    5500,
    "Villa",
    "photo-1564501049412-61c2a3083791",
    ["WiFi", "Pool", "Breakfast", "Parking"],
    15.2993,
    74.124,
  ],

  [
    "Cozy Wooden Cabin",
    "Manali",
    2900,
    "Cabin",
    "photo-1449158743715-0a90ebb6d2d8",
    ["WiFi", "Fireplace", "Kitchen", "Heating"],
    32.2432,
    77.1892,
  ],

  [
    "Sea View Retreat",
    "Kochi",
    4100,
    "Apartment",
    "photo-1499793983690-e29da59ef1c2",
    ["WiFi", "Sea view", "Kitchen", "Parking"],
    9.9312,
    76.2673,
  ],

  [
    "Heritage Haveli Stay",
    "Jaipur",
    3600,
    "House",
    "photo-1600607687920-4e2a09cf159d",
    ["WiFi", "Breakfast", "Garden", "Air conditioning"],
    26.9124,
    75.7873,
  ],

  [
    "Forest Retreat",
    "Rishikesh",
    3000,
    "House",
    "photo-1448375240586-882707db888b",
    ["WiFi", "Garden", "Parking", "Breakfast"],
    30.0869,
    78.2676,
  ],

  [
    "Royal Palace Stay",
    "Udaipur",
    4200,
    "Hotel",
    "photo-1542314831-068cd1dbfeeb",
    ["WiFi", "Pool", "Breakfast", "Lake view"],
    24.5854,
    73.7125,
  ],

  [
    "Peaceful Lake House",
    "Nainital",
    3500,
    "House",
    "photo-1505693416388-ac5ce068fe85",
    ["WiFi", "Lake view", "Kitchen", "Parking"],
    29.3919,
    79.4542,
  ],

  [
    "Elegant City Home",
    "Delhi",
    2800,
    "Apartment",
    "photo-1493809842364-78817add7ffb",
    ["WiFi", "AC", "Kitchen", "TV", "Workspace"],
    28.6139,
    77.209,
  ],

  [
    "Desert Luxury Villa",
    "Jaisalmer",
    3900,
    "Villa",
    "photo-1613490493576-7fde63acd811",
    ["WiFi", "Pool", "Breakfast", "Parking"],
    26.9157,
    70.9083,
  ],

  [
    "Hillside Luxury Hotel",
    "Shimla",
    3400,
    "Hotel",
    "photo-1510798831971-661eb04b3739",
    ["WiFi", "Mountain view", "Heating", "Breakfast"],
    31.1048,
    77.1734,
  ],

  [
    "Garden Villa Escape",
    "Bengaluru",
    3300,
    "Villa",
    "photo-1600607688969-a5bfcd646154",
    ["WiFi", "Garden", "Kitchen", "Pool"],
    12.9716,
    77.5946,
  ],

  [
    "Riverside Retreat",
    "Rishikesh",
    2700,
    "Cabin",
    "photo-1505693416388-ac5ce068fe85",
    ["WiFi", "River view", "Garden", "Parking"],
    30.1038,
    78.2948,
  ],

  [
    "Royal Heritage Hotel",
    "Jodhpur",
    4600,
    "Hotel",
    "photo-1564501049412-61c2a3083791",
    ["WiFi", "Breakfast", "Pool", "Air conditioning"],
    26.2389,
    73.0243,
  ],
];

await mongoose.connect(process.env.MONGO_URI);

console.log("MongoDB connected for seeding...");

// Clear old demo data
//await User.deleteMany({});
//await Listing.deleteMany({});

// Create demo password
const password = await bcrypt.hash("password123", 10);

// Create host
const host = await User.create({
  name: "StaySphere Host",
  email: "host@staysphere.com",
  password,
  role: "host",
});

// Create guest
await User.create({
  name: "Demo Guest",
  email: "guest@staysphere.com",
  password,
  role: "guest",
});

// Create listings
await Listing.insertMany(
  data.map(
    (
      [
        title,
        location,
        price,
        propertyType,
        img,
        amenities,
        latitude,
        longitude,
      ],
      i
    ) => ({
      title,

      description: `A thoughtfully designed ${propertyType.toLowerCase()} in ${location}, perfect for a comfortable getaway. Enjoy modern amenities, a welcoming atmosphere, beautiful surroundings, and a convenient location.`,

      location,

      country: "India",

      latitude,
      longitude,

      price,

      propertyType,

      guests: i % 3 === 0 ? 6 : 4,

      bedrooms: (i % 3) + 1,

      beds: (i % 3) + 2,

      bathrooms: (i % 2) + 1,

      amenities,

      images: [
        image(img),
        image("photo-1505691938895-1758d7feb511"),
        image("photo-1600566753086-00f18fb6b3ea"),
      ],

      host: host._id,

      rating: Number((4.5 + (i % 5) / 10).toFixed(1)),

      reviewCount: 12 + i * 7,
    })
  )
);

console.log("16 listings created successfully.");
console.log("Demo host: host@staysphere.com");
console.log("Demo guest: guest@staysphere.com");
console.log("Seed complete.");

await mongoose.disconnect();

console.log("MongoDB disconnected.");