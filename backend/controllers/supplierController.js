import asyncHandler from "express-async-handler";
import Supplier from "../models/Supplier.js";
import { getPagination, buildPaginatedResponse } from "../utils/paginate.js";

// @desc    Get suppliers (search, pagination)
// @route   GET /api/suppliers
export const getSuppliers = asyncHandler(async (req, res) => {
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
    Supplier.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Supplier.countDocuments(filter),
  ]);

  res.json(buildPaginatedResponse(items, total, page, limit));
});

// @desc    Get single supplier
// @route   GET /api/suppliers/:id
export const getSupplierById = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }
  res.json({ success: true, data: supplier });
});

// @desc    Create supplier
// @route   POST /api/suppliers
export const createSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.create(req.body);
  res.status(201).json({ success: true, data: supplier });
});

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
export const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }
  res.json({ success: true, data: supplier });
});

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
export const deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByIdAndDelete(req.params.id);
  if (!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }
  res.json({ success: true, message: "Supplier removed" });
});
