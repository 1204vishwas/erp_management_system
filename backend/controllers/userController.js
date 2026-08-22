import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import { getPagination, buildPaginatedResponse } from "../utils/paginate.js";

// @desc    Get all users (with search & pagination)
// @route   GET /api/users
// @access  Admin
export const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const search = req.query.search?.trim();

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (req.query.role) filter.role = req.query.role;

  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.json(buildPaginatedResponse(items, total, page, limit));
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ success: true, data: user });
});

// @desc    Create a user (Admin can set any role)
// @route   POST /api/users
// @access  Admin
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, address } = req.body;
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error("A user with this email already exists");
  }
  const user = await User.create({ name, email, password, role, phone, address });
  res.status(201).json({ success: true, data: user });
});

// @desc    Update a user (role / active / details)
// @route   PUT /api/users/:id
// @access  Admin
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("+password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { name, email, role, phone, address, active, password } = req.body;
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (role !== undefined) user.role = role;
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;
  if (active !== undefined) user.active = active;
  if (password) user.password = password;

  const updated = await user.save();
  updated.password = undefined;
  res.json({ success: true, data: updated });
});

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Admin
export const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === String(req.user._id)) {
    res.status(400);
    throw new Error("You cannot delete your own account");
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ success: true, message: "User removed" });
});
