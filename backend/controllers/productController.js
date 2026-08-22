import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import { getPagination, buildPaginatedResponse } from "../utils/paginate.js";

// @desc    Get products (search, filter, pagination)
// @route   GET /api/products
// @access  Private
export const getProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const search = req.query.search?.trim();

  const filter = {};
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ];
  }
  if (req.query.category) filter.category = req.query.category;
  if (req.query.lowStock === "true") {
    filter.$expr = { $lte: ["$stock", "$reorderLevel"] };
  }

  const [items, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json(buildPaginatedResponse(items, total, page, limit));
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json({ success: true, data: product });
});

// @desc    Create product
// @route   POST /api/products
// @access  Admin, Inventory
export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin, Inventory
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json({ success: true, data: product });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Admin, Inventory
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json({ success: true, message: "Product removed" });
});
