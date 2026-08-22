import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import Supplier from "../models/Supplier.js";

dotenv.config();

/**
 * Seed the database with a default Admin, a few users, products,
 * customers and suppliers so the app is usable immediately.
 *
 * Run with:  npm run seed
 */
const seed = async () => {
  try {
    await connectDB();

    console.log("Clearing existing users/products/customers/suppliers...");
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Customer.deleteMany({}),
      Supplier.deleteMany({}),
    ]);

    console.log("Creating users...");
    await User.create([
      { name: "System Admin", email: "admin@erp.com", password: "admin123", role: "Admin" },
      { name: "Sam Sales", email: "sales@erp.com", password: "sales123", role: "Sales" },
      { name: "Pat Purchase", email: "purchase@erp.com", password: "purchase123", role: "Purchase" },
      { name: "Ivy Inventory", email: "inventory@erp.com", password: "inventory123", role: "Inventory" },
    ]);

    console.log("Creating products...");
    await Product.create([
      { title: "Wireless Mouse", sku: "WM-001", category: "Electronics", price: 799, stock: 120, reorderLevel: 20 },
      { title: "Mechanical Keyboard", sku: "KB-002", category: "Electronics", price: 2499, stock: 8, reorderLevel: 15 },
      { title: "USB-C Cable", sku: "UC-003", category: "Accessories", price: 299, stock: 500, reorderLevel: 50 },
      { title: "27-inch Monitor", sku: "MN-004", category: "Electronics", price: 15999, stock: 5, reorderLevel: 10 },
      { title: "Office Chair", sku: "OC-005", category: "Furniture", price: 6499, stock: 40, reorderLevel: 10 },
    ]);

    console.log("Creating customers...");
    await Customer.create([
      { name: "Acme Corp", company: "Acme Corp", email: "buy@acme.com", contact: "9876543210", address: "12 Market St" },
      { name: "Globex Ltd", company: "Globex", email: "orders@globex.com", contact: "9123456780", address: "88 Industrial Ave" },
    ]);

    console.log("Creating suppliers...");
    await Supplier.create([
      { name: "TechDistro", company: "TechDistro Pvt Ltd", email: "sales@techdistro.com", contact: "9000011111", address: "5 Wholesale Rd" },
      { name: "FurniSource", company: "FurniSource", email: "hello@furnisource.com", contact: "9000022222", address: "9 Timber Ln" },
    ]);

    console.log("\nSeed complete! Login with:");
    console.log("  Admin      -> admin@erp.com / admin123");
    console.log("  Sales      -> sales@erp.com / sales123");
    console.log("  Purchase   -> purchase@erp.com / purchase123");
    console.log("  Inventory  -> inventory@erp.com / inventory123");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seed();
