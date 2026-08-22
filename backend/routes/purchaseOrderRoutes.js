import express from "express";
import { body } from "express-validator";
import {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
} from "../controllers/purchaseOrderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

/**
 * @swagger
 * /api/purchase-orders:
 *   get: { tags: [Purchase Orders], summary: List purchase orders, responses: { 200: { description: OK } } }
 *   post: { tags: [Purchase Orders], summary: Create purchase order (Purchase), responses: { 201: { description: Created } } }
 */
router
  .route("/")
  .get(protect, getPurchaseOrders)
  .post(
    protect,
    authorize("Purchase"),
    [
      body("supplier").notEmpty().withMessage("Supplier is required"),
      body("products").isArray({ min: 1 }).withMessage("At least one product is required"),
    ],
    validate,
    createPurchaseOrder
  );

/**
 * @swagger
 * /api/purchase-orders/{id}:
 *   get: { tags: [Purchase Orders], summary: Get purchase order, responses: { 200: { description: OK } } }
 *   put: { tags: [Purchase Orders], summary: Update purchase order, responses: { 200: { description: Updated } } }
 *   delete: { tags: [Purchase Orders], summary: Delete purchase order, responses: { 200: { description: Deleted } } }
 */
router
  .route("/:id")
  .get(protect, getPurchaseOrderById)
  .put(protect, authorize("Purchase"), updatePurchaseOrder)
  .delete(protect, authorize("Purchase"), deletePurchaseOrder);

export default router;
