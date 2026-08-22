import express from "express";
import { body } from "express-validator";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

const productValidation = [
  body("title").notEmpty().withMessage("Title is required"),
  body("sku").notEmpty().withMessage("SKU is required"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be >= 0"),
  body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be >= 0"),
];

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: List products (search, filter, pagination)
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *     responses: { 200: { description: OK } }
 *   post:
 *     tags: [Products]
 *     summary: Create a product (Admin/Inventory)
 *     responses: { 201: { description: Created } }
 */
router
  .route("/")
  .get(protect, getProducts)
  .post(protect, authorize("Inventory"), productValidation, validate, createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   get: { tags: [Products], summary: Get a product, responses: { 200: { description: OK } } }
 *   put: { tags: [Products], summary: Update a product, responses: { 200: { description: Updated } } }
 *   delete: { tags: [Products], summary: Delete a product, responses: { 200: { description: Deleted } } }
 */
router
  .route("/:id")
  .get(protect, getProductById)
  .put(protect, authorize("Inventory"), updateProduct)
  .delete(protect, authorize("Inventory"), deleteProduct);

export default router;
