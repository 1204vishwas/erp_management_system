import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

// Invoice - linked to a Sales Order.
const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    salesOrder: { type: mongoose.Schema.Types.ObjectId, ref: "SalesOrder", required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    items: { type: [invoiceItemSchema], validate: (v) => v.length > 0 },
    subTotal: { type: Number, required: true, min: 0, default: 0 },
    taxRate: { type: Number, min: 0, default: 18 },
    taxAmount: { type: Number, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0, default: 0 },
    status: { type: String, enum: ["Unpaid", "Paid", "Cancelled"], default: "Unpaid" },
    dueDate: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;
