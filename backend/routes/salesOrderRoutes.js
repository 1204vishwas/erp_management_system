import express from "express";
import { body } from "express-validator";
import {
  getSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  updateSalesOrder,
  deleteSalesOrder,
} from "../controllers/salesOrderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

/**
 * @swagger
 * /api/sales-orders:
 *   get: { tags: [Sales Orders], summary: List sales orders, responses: { 200: { description: OK } } }
 *   post: { tags: [Sales Orders], summary: Create sales order (Sales), responses: { 201: { description: Created } } }
 */
router
  .route("/")
  .get(protect, getSalesOrders)
  .post(
    protect,
    authorize("Sales"),
    [
      body("customer").notEmpty().withMessage("Customer is required"),
      body("products").isArray({ min: 1 }).withMessage("At least one product is required"),
    ],
    validate,
    createSalesOrder
  );

/**
 * @swagger
 * /api/sales-orders/{id}:
 *   get: { tags: [Sales Orders], summary: Get sales order, responses: { 200: { description: OK } } }
 *   put: { tags: [Sales Orders], summary: Update sales order, responses: { 200: { description: Updated } } }
 *   delete: { tags: [Sales Orders], summary: Delete sales order, responses: { 200: { description: Deleted } } }
 */
router
  .route("/:id")
  .get(protect, getSalesOrderById)
  .put(protect, authorize("Sales"), updateSalesOrder)
  .delete(protect, authorize("Sales"), deleteSalesOrder);

export default router;
