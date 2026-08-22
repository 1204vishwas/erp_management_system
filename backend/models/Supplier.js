import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    contact: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },
    address: { type: String, trim: true, default: "" },
    company: { type: String, trim: true, default: "" },
    gstNo: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

const Supplier = mongoose.model("Supplier", supplierSchema);
export default Supplier;
