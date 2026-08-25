import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import SalesOrder from "../models/SalesOrder.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import GRN from "../models/GRN.js";
import Invoice from "../models/Invoice.js";

/**
 * Build a date filter from optional ?from=&to= query params (inclusive).
 */
const dateFilter = (query) => {
  const filter = {};
  if (query.from || query.to) {
    filter.createdAt = {};
    if (query.from) filter.createdAt.$gte = new Date(query.from);
    if (query.to) {
      const to = new Date(query.to);
      to.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = to;
    }
  }
  return filter;
};

const sumField = (rows, field) => rows.reduce((s, r) => s + (r[field] || 0), 0);

// @desc    Consolidated business report / balance sheet
// @route   GET /api/reports?from=&to=
// @access  Private (Admin sees everything; any authed user can view)
export const getReports = asyncHandler(async (req, res) => {
  const range = dateFilter(req.query);

  const [sales, purchases, grns, invoices, products] = await Promise.all([
    SalesOrder.find(range).select("orderNumber totalPrice status createdAt").lean(),
    PurchaseOrder.find(range)
      .select("orderNumber totalPrice status paymentStatus amountPaid createdAt")
      .lean(),
    GRN.find(range).populate("purchaseOrder", "orderNumber").select("grnNumber items createdAt").lean(),
    Invoice.find(range).select("invoiceNumber total subTotal taxAmount status createdAt").lean(),
    Product.find().select("title sku stock price reorderLevel").lean(),
  ]);

  // ---- Sales summary ----
  const salesTotal = sumField(sales, "totalPrice");
  const salesByStatus = groupCount(sales, "status", "totalPrice");

  // ---- Purchase summary ----
  const purchaseTotal = sumField(purchases, "totalPrice");
  const purchaseByStatus = groupCount(purchases, "status", "totalPrice");
  // Money OUT: what we have actually paid suppliers vs what we still owe.
  const purchasePaid = purchases.reduce((s, p) => s + (p.amountPaid || 0), 0);
  const purchasePayable = purchaseTotal - purchasePaid; // money we still owe

  // ---- GRN summary (goods received) ----
  let receivedQty = 0;
  grns.forEach((g) => {
    g.items.forEach((it) => {
      receivedQty += it.receivedQty || 0;
    });
  });

  // ---- Invoice summary ----
  const invoicedTotal = sumField(invoices, "total");
  const invoiceSubTotal = sumField(invoices, "subTotal");
  const taxCollected = sumField(invoices, "taxAmount");
  const paidInvoices = invoices.filter((i) => i.status === "Paid");
  const unpaidInvoices = invoices.filter((i) => i.status === "Unpaid");
  const totalPaid = sumField(paidInvoices, "total");
  const totalReceivable = sumField(unpaidInvoices, "total"); // money owed to us

  // ---- Inventory (asset) value ----
  const inventoryValue = products.reduce((s, p) => s + p.stock * p.price, 0);

  // ---- Balance sheet (simple ERP statement) ----
  // Assets  = cash received (paid invoices) + receivables (unpaid) + inventory value
  // Outflow = purchase expenditure
  // Net position = assets - purchase expenditure
  const assetsTotal = totalPaid + totalReceivable + inventoryValue;
  const netPosition = assetsTotal - purchaseTotal;

  res.json({
    success: true,
    data: {
      range: { from: req.query.from || null, to: req.query.to || null },
      sales: {
        count: sales.length,
        total: salesTotal,
        byStatus: salesByStatus,
      },
      purchases: {
        count: purchases.length,
        total: purchaseTotal,
        byStatus: purchaseByStatus,
      },
      grn: {
        count: grns.length,
        receivedQty,
        recent: grns.slice(-5).reverse().map((g) => ({
          grnNumber: g.grnNumber,
          purchaseOrder: g.purchaseOrder?.orderNumber || "-",
          items: g.items.length,
          qty: g.items.reduce((s, it) => s + (it.receivedQty || 0), 0),
          date: g.createdAt,
        })),
      },
      invoices: {
        count: invoices.length,
        invoicedTotal,
        subTotal: invoiceSubTotal,
        taxCollected,
        paidCount: paidInvoices.length,
        unpaidCount: unpaidInvoices.length,
        totalPaid,
        totalReceivable,
      },
      inventory: {
        value: inventoryValue,
        productCount: products.length,
      },
      // Traffic-light money view: what came IN vs what went OUT.
      moneyFlow: {
        received: totalPaid, // GREEN  - money received (paid invoices)
        toReceive: totalReceivable, // ORANGE - money owed to us (unpaid invoices)
        paidOut: purchasePaid, // GREEN  - money we've paid suppliers
        toPay: purchasePayable, // RED    - money we still owe suppliers
        netCash: totalPaid - purchasePaid, // received minus paid out
      },
      balanceSheet: {
        // Income / assets side
        cashReceived: totalPaid,
        accountsReceivable: totalReceivable,
        inventoryValue,
        assetsTotal,
        // Expenditure side
        purchaseExpenditure: purchaseTotal,
        purchasePaid,
        purchasePayable,
        // Bottom line
        netPosition,
        taxCollected,
      },
    },
  });
});

/**
 * Group rows by a key, counting and summing a numeric field.
 */
function groupCount(rows, key, sumKey) {
  const map = {};
  rows.forEach((r) => {
    const k = r[key] || "Unknown";
    if (!map[k]) map[k] = { status: k, count: 0, total: 0 };
    map[k].count += 1;
    map[k].total += r[sumKey] || 0;
  });
  return Object.values(map);
}
