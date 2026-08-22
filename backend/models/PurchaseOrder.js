import mongoose from "mongoose";

const lineItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const purchaseOrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    products: { type: [lineItemSchema], validate: (v) => v.length > 0 },
    status: {
      type: String,
      enum: ["Pending", "Ordered", "Received", "Cancelled"],
      default: "Pending",
    },
    totalPrice: { type: Number, required: true, min: 0, default: 0 },
    notes: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const PurchaseOrder = mongoose.model("PurchaseOrder", purchaseOrderSchema);
export default PurchaseOrder;
