import asyncHandler from "express-async-handler";
import SalesOrder from "../models/SalesOrder.js";
import Product from "../models/Product.js";
import { nextSequence } from "../models/Counter.js";
import { getPagination, buildPaginatedResponse } from "../utils/paginate.js";

/**
 * Resolve raw line items ({ product, quantity }) against the Product
 * collection, snapshotting the current title & price and computing the total.
 */
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

// @desc    Get sales orders (search by order number / status, pagination)
// @route   GET /api/sales-orders
export const getSalesOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const search = req.query.search?.trim();

  const filter = {};
  if (search) filter.orderNumber = { $regex: search, $options: "i" };
  if (req.query.status) filter.status = req.query.status;

  const [items, total] = await Promise.all([
    SalesOrder.find(filter)
      .populate("customer", "name company email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    SalesOrder.countDocuments(filter),
  ]);

  res.json(buildPaginatedResponse(items, total, page, limit));
});

// @desc    Get single sales order
// @route   GET /api/sales-orders/:id
export const getSalesOrderById = asyncHandler(async (req, res) => {
  const order = await SalesOrder.findById(req.params.id)
    .populate("customer")
    .populate("createdBy", "name email");
  if (!order) {
    res.status(404);
    throw new Error("Sales order not found");
  }
  res.json({ success: true, data: order });
});

// @desc    Create sales order
// @route   POST /api/sales-orders
export const createSalesOrder = asyncHandler(async (req, res) => {
  const { customer, products, status, notes } = req.body;
  const { items, totalPrice } = await buildLineItems(products);

  const orderNumber = await nextSequence("salesOrder", "SO");
  const order = await SalesOrder.create({
    orderNumber,
    customer,
    products: items,
    status,
    totalPrice,
    notes,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: order });
});

// @desc    Update sales order (status / items)
// @route   PUT /api/sales-orders/:id
export const updateSalesOrder = asyncHandler(async (req, res) => {
  const order = await SalesOrder.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Sales order not found");
  }

  const { customer, products, status, notes } = req.body;
  if (customer) order.customer = customer;
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

// @desc    Delete sales order
// @route   DELETE /api/sales-orders/:id
export const deleteSalesOrder = asyncHandler(async (req, res) => {
  const order = await SalesOrder.findByIdAndDelete(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Sales order not found");
  }
  res.json({ success: true, message: "Sales order removed" });
});
