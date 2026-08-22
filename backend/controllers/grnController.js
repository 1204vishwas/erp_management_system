import asyncHandler from "express-async-handler";
import GRN from "../models/GRN.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import Product from "../models/Product.js";
import { nextSequence } from "../models/Counter.js";
import { getPagination, buildPaginatedResponse } from "../utils/paginate.js";

// @desc    Get GRNs
// @route   GET /api/grn
export const getGRNs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const search = req.query.search?.trim();

  const filter = {};
  if (search) filter.grnNumber = { $regex: search, $options: "i" };

  const [items, total] = await Promise.all([
    GRN.find(filter)
      .populate("purchaseOrder", "orderNumber")
      .populate("supplier", "name company")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    GRN.countDocuments(filter),
  ]);

  res.json(buildPaginatedResponse(items, total, page, limit));
});

// @desc    Get single GRN
// @route   GET /api/grn/:id
export const getGRNById = asyncHandler(async (req, res) => {
  const grn = await GRN.findById(req.params.id)
    .populate("purchaseOrder")
    .populate("supplier")
    .populate("receivedBy", "name email");
  if (!grn) {
    res.status(404);
    throw new Error("GRN not found");
  }
  res.json({ success: true, data: grn });
});

// @desc    Create GRN against a purchase order (updates stock + PO status)
// @route   POST /api/grn
export const createGRN = asyncHandler(async (req, res) => {
  const { purchaseOrder, items: bodyItems, remarks, receivedDate } = req.body;

  const po = await PurchaseOrder.findById(purchaseOrder);
  if (!po) {
    res.status(400);
    throw new Error("Linked purchase order not found");
  }

  // Build received items from PO lines. If the client sends receivedQty per
  // line, use it; otherwise default to the full ordered quantity.
  const overrides = new Map(
    (bodyItems || []).map((i) => [String(i.product), Number(i.receivedQty)])
  );

  const items = po.products.map((line) => {
    const received = overrides.has(String(line.product))
      ? overrides.get(String(line.product))
      : line.quantity;
    return {
      product: line.product,
      title: line.title,
      orderedQty: line.quantity,
      receivedQty: Math.max(0, received || 0),
    };
  });

  // Increment stock for each received product.
  for (const item of items) {
    if (item.receivedQty > 0) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.receivedQty },
      });
    }
  }

  const grnNumber = await nextSequence("grn", "GRN");
  const grn = await GRN.create({
    grnNumber,
    purchaseOrder: po._id,
    supplier: po.supplier,
    items,
    remarks,
    receivedDate: receivedDate || Date.now(),
    receivedBy: req.user._id,
  });

  // Mark the purchase order as received.
  po.status = "Received";
  await po.save();

  res.status(201).json({ success: true, data: grn });
});

// @desc    Delete GRN
// @route   DELETE /api/grn/:id
export const deleteGRN = asyncHandler(async (req, res) => {
  const grn = await GRN.findByIdAndDelete(req.params.id);
  if (!grn) {
    res.status(404);
    throw new Error("GRN not found");
  }
  res.json({ success: true, message: "GRN removed" });
});
