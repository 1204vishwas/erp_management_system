import express from "express";
import { body } from "express-validator";
import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../controllers/supplierController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

/**
 * @swagger
 * /api/suppliers:
 *   get: { tags: [Suppliers], summary: List suppliers, responses: { 200: { description: OK } } }
 *   post: { tags: [Suppliers], summary: Create supplier, responses: { 201: { description: Created } } }
 */
router
  .route("/")
  .get(protect, getSuppliers)
  .post(
    protect,
    authorize("Purchase"),
    [body("name").notEmpty().withMessage("Name is required")],
    validate,
    createSupplier
  );

/**
 * @swagger
 * /api/suppliers/{id}:
 *   get: { tags: [Suppliers], summary: Get supplier, responses: { 200: { description: OK } } }
 *   put: { tags: [Suppliers], summary: Update supplier, responses: { 200: { description: Updated } } }
 *   delete: { tags: [Suppliers], summary: Delete supplier, responses: { 200: { description: Deleted } } }
 */
router
  .route("/:id")
  .get(protect, getSupplierById)
  .put(protect, authorize("Purchase"), updateSupplier)
  .delete(protect, authorize("Purchase"), deleteSupplier);

export default router;
