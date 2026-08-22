import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true, uppercase: true },
    category: { type: String, trim: true, default: "General" },
    price: { type: Number, required: true, min: 0, default: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    reorderLevel: { type: Number, min: 0, default: 10 },
    description: { type: String, trim: true, default: "" },
    imageUrl: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

// Virtual flag: is the product below its reorder level?
productSchema.virtual("lowStock").get(function () {
  return this.stock <= this.reorderLevel;
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

const Product = mongoose.model("Product", productSchema);
export default Product;
