import mongoose from "mongoose";

const receivedItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true },
    orderedQty: { type: Number, required: true, min: 0 },
    receivedQty: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

// Goods Receipt Note - linked to a Purchase Order.
const grnSchema = new mongoose.Schema(
  {
    grnNumber: { type: String, required: true, unique: true },
    purchaseOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
      required: true,
    },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
    items: { type: [receivedItemSchema], validate: (v) => v.length > 0 },
    receivedDate: { type: Date, default: Date.now },
    remarks: { type: String, default: "" },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const GRN = mongoose.model("GRN", grnSchema);
export default GRN;
