import asyncHandler from "express-async-handler";
import PurchaseOrder from "../models/PurchaseOrder.js";
import Product from "../models/Product.js";
import { nextSequence } from "../models/Counter.js";
import { getPagination, buildPaginatedResponse } from "../utils/paginate.js";

const buildLineItems = async (rawItems = []) => {
  const items = [];
  let totalPrice = 0;
  for (const raw of rawItems) {
    const product = await Product.findById(raw.product);
    if (!product) {
      const err = new Error(`Product not found: ${raw.product}`);
      err.statusCode = 400;
      throw err;
    }
    const quantity = Number(raw.quantity) || 1;
    const price = raw.price != null ? Number(raw.price) : product.price;
    items.push({ product: product._id, title: product.title, quantity, price });
    totalPrice += quantity * price;
  }
  return { items, totalPrice };
};

// @desc    Get purchase orders
// @route   GET /api/purchase-orders
export const getPurchaseOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const search = req.query.search?.trim();

  const filter = {};
  if (search) filter.orderNumber = { $regex: search, $options: "i" };
  if (req.query.status) filter.status = req.query.status;

  const [items, total] = await Promise.all([
    PurchaseOrder.find(filter)
      .populate("supplier", "name company email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    PurchaseOrder.countDocuments(filter),
  ]);

  res.json(buildPaginatedResponse(items, total, page, limit));
});

// @desc    Get single purchase order
// @route   GET /api/purchase-orders/:id
export const getPurchaseOrderById = asyncHandler(async (req, res) => {
  const order = await PurchaseOrder.findById(req.params.id)
    .populate("supplier")
    .populate("createdBy", "name email");
  if (!order) {
    res.status(404);
    throw new Error("Purchase order not found");
  }
  res.json({ success: true, data: order });
});

// @desc    Create purchase order
// @route   POST /api/purchase-orders
export const createPurchaseOrder = asyncHandler(async (req, res) => {
  const { supplier, products, status, notes } = req.body;
  const { items, totalPrice } = await buildLineItems(products);

  const orderNumber = await nextSequence("purchaseOrder", "PO");
  const order = await PurchaseOrder.create({
    orderNumber,
    supplier,
    products: items,
    status,
    totalPrice,
    notes,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: order });
});

// @desc    Update purchase order
// @route   PUT /api/purchase-orders/:id
export const updatePurchaseOrder = asyncHandler(async (req, res) => {
  const order = await PurchaseOrder.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Purchase order not found");
  }

  const { supplier, products, status, notes } = req.body;
  if (supplier) order.supplier = supplier;
  if (status) order.status = status;
  if (notes !== undefined) order.notes = notes;
  if (Array.isArray(products) && products.length) {
    const { items, totalPrice } = await buildLineItems(products);
    order.products = items;
    order.totalPrice = totalPrice;
  }

  const updated = await order.save();
  res.json({ success: true, data: updated });
});

// @desc    Delete purchase order
// @route   DELETE /api/purchase-orders/:id
export const deletePurchaseOrder = asyncHandler(async (req, res) => {
  const order = await PurchaseOrder.findByIdAndDelete(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Purchase order not found");
  }
  res.json({ success: true, message: "Purchase order removed" });
});
