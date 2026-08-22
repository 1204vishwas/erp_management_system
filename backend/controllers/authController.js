import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const toAuthResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  address: user.address,
});

// @desc    Register a new user
// @route   POST /api/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error("A user with this email already exists");
  }

  // Only allow self-registration into non-admin roles for safety.
  const safeRole = role && role !== "Admin" ? role : "Sales";

  const user = await User.create({ name, email, password, role: safeRole });

  res.status(201).json({
    success: true,
    token: generateToken(user._id, user.role),
    user: toAuthResponse(user),
  });
});

// @desc    Authenticate user and get token
// @route   POST /api/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }
  if (!user.active) {
    res.status(403);
    throw new Error("Account is deactivated. Contact an administrator.");
  }

  res.json({
    success: true,
    token: generateToken(user._id, user.role),
    user: toAuthResponse(user),
  });
});

// @desc    Get current user's profile
// @route   GET /api/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user: toAuthResponse(user) });
});

// @desc    Update current user's profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { name, phone, address, password } = req.body;
  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;
  if (password) user.password = password; // re-hashed by pre-save hook

  const updated = await user.save();
  res.json({ success: true, user: toAuthResponse(updated) });
});
