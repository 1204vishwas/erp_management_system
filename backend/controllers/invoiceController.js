import asyncHandler from "express-async-handler";
import Invoice from "../models/Invoice.js";
import SalesOrder from "../models/SalesOrder.js";
import { nextSequence } from "../models/Counter.js";
import { getPagination, buildPaginatedResponse } from "../utils/paginate.js";

// @desc    Get invoices
// @route   GET /api/invoices
export const getInvoices = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const search = req.query.search?.trim();

  const filter = {};
  if (search) filter.invoiceNumber = { $regex: search, $options: "i" };
  if (req.query.status) filter.status = req.query.status;

  const [items, total] = await Promise.all([
    Invoice.find(filter)
      .populate("customer", "name company email")
      .populate("salesOrder", "orderNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Invoice.countDocuments(filter),
  ]);

  res.json(buildPaginatedResponse(items, total, page, limit));
});

// @desc    Get single invoice (by ID)
// @route   GET /api/invoices/:id
export const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate("customer")
    .populate("salesOrder")
    .populate("createdBy", "name email");
  if (!invoice) {
    res.status(404);
    throw new Error("Invoice not found");
  }
  res.json({ success: true, data: invoice });
});

// @desc    Generate an invoice from a sales order
// @route   POST /api/invoices
export const createInvoice = asyncHandler(async (req, res) => {
  const { salesOrder, taxRate = 18, dueDate, status } = req.body;

  const order = await SalesOrder.findById(salesOrder).populate("customer");
  if (!order) {
    res.status(400);
    throw new Error("Linked sales order not found");
  }

  const items = order.products.map((p) => ({
    title: p.title,
    quantity: p.quantity,
    price: p.price,
  }));
  const subTotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
  const taxAmount = +((subTotal * taxRate) / 100).toFixed(2);
  const total = +(subTotal + taxAmount).toFixed(2);

  const invoiceNumber = await nextSequence("invoice", "INV");
  const invoice = await Invoice.create({
    invoiceNumber,
    salesOrder: order._id,
    customer: order.customer._id,
    items,
    subTotal,
    taxRate,
    taxAmount,
    total,
    status: status || "Unpaid",
    dueDate,
    createdBy: req.user._id,
  });

  // Auto-advance the sales order: once invoiced, a Pending order is Confirmed.
  if (order.status === "Pending") {
    order.status = "Confirmed";
    await order.save();
  }

  const populated = await invoice.populate("customer salesOrder");
  res.status(201).json({ success: true, data: populated });
});

// @desc    Update invoice status
// @route   PUT /api/invoices/:id
export const updateInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) {
    res.status(404);
    throw new Error("Invoice not found");
  }
  const { status, dueDate } = req.body;
  if (status) invoice.status = status;
  if (dueDate) invoice.dueDate = dueDate;
  const updated = await invoice.save();

  // When an invoice is marked Paid, auto-complete its sales order.
  if (status === "Paid") {
    await SalesOrder.findByIdAndUpdate(invoice.salesOrder, { status: "Completed" });
  }

  res.json({ success: true, data: updated });
});

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
export const deleteInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findByIdAndDelete(req.params.id);
  if (!invoice) {
    res.status(404);
    throw new Error("Invoice not found");
  }
  res.json({ success: true, message: "Invoice removed" });
});
