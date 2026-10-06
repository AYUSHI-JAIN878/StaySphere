import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ===============================
// GENERATE JWT TOKEN
// ===============================
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ===============================
// REGISTER
// ===============================
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = "guest",
    } = req.body;

    // -------------------------------
    // Validation
    // -------------------------------
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // -------------------------------
    // Only allow valid roles
    // -------------------------------
    const validRoles = ["guest", "host"];

    const selectedRole = validRoles.includes(role)
      ? role
      : "guest";

    // -------------------------------
    // Check existing user
    // -------------------------------
    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // -------------------------------
    // Hash password
    // -------------------------------
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // -------------------------------
    // Create user
    // -------------------------------
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      role: selectedRole,
    });

    // -------------------------------
    // Send response
    // -------------------------------
    return res.status(201).json({
      message: "Registration successful",

      token: generateToken(user._id),

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      message:
        error.message || "Registration failed",
    });
  }
};

// ===============================
// LOGIN
// ===============================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // -------------------------------
    // Validation
    // -------------------------------
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // -------------------------------
    // Find user
    // -------------------------------
    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // -------------------------------
    // Compare password
    // -------------------------------
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // -------------------------------
    // Generate token
    // -------------------------------
    const token = generateToken(user._id);

    // -------------------------------
    // Successful login
    // -------------------------------
    return res.status(200).json({
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message: error.message || "Login failed",
    });
  }
};

// ===============================
// GET CURRENT USER
// ===============================
export const me = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    return res.status(200).json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    });
  } catch (error) {
    console.error("GET CURRENT USER ERROR:", error);

    return res.status(500).json({
      message: "Unable to fetch user",
    });
  }
};