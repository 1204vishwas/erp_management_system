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

const salesOrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    products: { type: [lineItemSchema], validate: (v) => v.length > 0 },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Shipped", "Completed", "Cancelled"],
      default: "Pending",
    },
    totalPrice: { type: Number, required: true, min: 0, default: 0 },
    notes: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const SalesOrder = mongoose.model("SalesOrder", salesOrderSchema);
export default SalesOrder;
