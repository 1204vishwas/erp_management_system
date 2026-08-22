import asyncHandler from "express-async-handler";
import Customer from "../models/Customer.js";
import { getPagination, buildPaginatedResponse } from "../utils/paginate.js";

// @desc    Get customers (search, pagination)
// @route   GET /api/customers
export const getCustomers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const search = req.query.search?.trim();

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
      { contact: { $regex: search, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Customer.countDocuments(filter),
  ]);

  res.json(buildPaginatedResponse(items, total, page, limit));
});

// @desc    Get single customer
// @route   GET /api/customers/:id
export const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }
  res.json({ success: true, data: customer });
});

// @desc    Create customer
// @route   POST /api/customers
export const createCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.create(req.body);
  res.status(201).json({ success: true, data: customer });
});

// @desc    Update customer
// @route   PUT /api/customers/:id
export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }
  res.json({ success: true, data: customer });
});

// @desc    Delete customer
// @route   DELETE /api/customers/:id
export const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);
  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }
  res.json({ success: true, message: "Customer removed" });
});
