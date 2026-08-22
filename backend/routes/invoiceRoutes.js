import express from "express";
import { body } from "express-validator";
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from "../controllers/invoiceController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

/**
 * @swagger
 * /api/invoices:
 *   get: { tags: [Invoices], summary: List invoices (GET all), responses: { 200: { description: OK } } }
 *   post:
 *     tags: [Invoices]
 *     summary: Generate an invoice from a sales order
 *     responses: { 201: { description: Created } }
 */
router
  .route("/")
  .get(protect, getInvoices)
  .post(
    protect,
    authorize("Sales"),
    [body("salesOrder").notEmpty().withMessage("Sales order is required")],
    validate,
    createInvoice
  );

/**
 * @swagger
 * /api/invoices/{id}:
 *   get: { tags: [Invoices], summary: Get invoice by ID, responses: { 200: { description: OK } } }
 *   put: { tags: [Invoices], summary: Update invoice status, responses: { 200: { description: Updated } } }
 *   delete: { tags: [Invoices], summary: Delete invoice, responses: { 200: { description: Deleted } } }
 */
router
  .route("/:id")
  .get(protect, getInvoiceById)
  .put(protect, authorize("Sales"), updateInvoice)
  .delete(protect, authorize("Sales"), deleteInvoice);

export default router;
