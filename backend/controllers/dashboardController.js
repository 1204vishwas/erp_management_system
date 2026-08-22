import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import Supplier from "../models/Supplier.js";
import SalesOrder from "../models/SalesOrder.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import Invoice from "../models/Invoice.js";
import User from "../models/User.js";

// @desc    Aggregate metrics & chart data for the dashboard
// @route   GET /api/dashboard
// @access  Private
export const getDashboard = asyncHandler(async (req, res) => {
  const [
    products,
    customers,
    suppliers,
    salesOrders,
    purchaseOrders,
    invoices,
    users,
    lowStock,
  ] = await Promise.all([
    Product.countDocuments(),
    Customer.countDocuments(),
    Supplier.countDocuments(),
    SalesOrder.countDocuments(),
    PurchaseOrder.countDocuments(),
    Invoice.countDocuments(),
    User.countDocuments(),
    Product.countDocuments({ $expr: { $lte: ["$stock", "$reorderLevel"] } }),
  ]);

  // Total revenue from paid invoices.
  const revenueAgg = await Invoice.aggregate([
    { $match: { status: "Paid" } },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);
  const revenue = revenueAgg[0]?.total || 0;

  // Sales orders per month (last 6 months) for the bar/line chart.
  const salesByMonth = await SalesOrder.aggregate([
    {
      $group: {
        _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } },
        count: { $sum: 1 },
        total: { $sum: "$totalPrice" },
      },
    },
    { $sort: { "_id.y": 1, "_id.m": 1 } },
    { $limit: 12 },
  ]);

  // Sales order status distribution for the pie chart.
  const salesByStatus = await SalesOrder.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  // Top 5 low-stock products for the inventory alert widget.
  const lowStockProducts = await Product.find({
    $expr: { $lte: ["$stock", "$reorderLevel"] },
  })
    .select("title sku stock reorderLevel")
    .limit(5);

  res.json({
    success: true,
    data: {
      counts: {
        products,
        customers,
        suppliers,
        salesOrders,
        purchaseOrders,
        invoices,
        users,
        lowStock,
        revenue,
      },
      charts: {
        salesByMonth: salesByMonth.map((s) => ({
          month: `${s._id.y}-${String(s._id.m).padStart(2, "0")}`,
          count: s.count,
          total: s.total,
        })),
        salesByStatus: salesByStatus.map((s) => ({
          status: s._id,
          count: s.count,
        })),
      },
      lowStockProducts,
    },
  });
});
