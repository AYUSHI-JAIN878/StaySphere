# StaySphere — MERN Vacation Rental Platform

A full-stack vacation rental and booking platform built with MongoDB, Express.js, React, and Node.js.

## Features
- Guest/Host authentication with JWT
- Role-based access control
- Property CRUD for hosts
- Search and filters
- Property image URLs
- Booking and availability checks
- Price calculation
- Reviews and ratings
- Wishlist
- Guest and host dashboards
- Responsive Tailwind UI
- Demo seed data
- Optional Razorpay payment integration

## Run locally

### Backend
```bash
cd server
npm install
copy .env.example .env
npm run seed
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

Set `VITE_API_URL=http://localhost:5000/api` in `client/.env`.

MongoDB must be running locally or use a MongoDB Atlas connection string.

Demo accounts after seeding:
- Guest: guest@staysphere.com / password123
- Host: host@staysphere.com / password123

Payment is intentionally optional: the booking flow works in demo mode when Razorpay keys are not configured.
