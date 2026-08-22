import express from "express";
import { body } from "express-validator";
import {
  getGRNs,
  getGRNById,
  createGRN,
  deleteGRN,
} from "../controllers/grnController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

/**
 * @swagger
 * /api/grn:
 *   get: { tags: [GRN], summary: List goods receipt notes, responses: { 200: { description: OK } } }
 *   post:
 *     tags: [GRN]
 *     summary: Create GRN linked to a purchase order (increments stock)
 *     responses: { 201: { description: Created } }
 */
router
  .route("/")
  .get(protect, getGRNs)
  .post(
    protect,
    authorize("Inventory", "Purchase"),
    [body("purchaseOrder").notEmpty().withMessage("Purchase order is required")],
    validate,
    createGRN
  );

/**
 * @swagger
 * /api/grn/{id}:
 *   get: { tags: [GRN], summary: Get GRN, responses: { 200: { description: OK } } }
 *   delete: { tags: [GRN], summary: Delete GRN, responses: { 200: { description: Deleted } } }
 */
router
  .route("/:id")
  .get(protect, getGRNById)
  .delete(protect, authorize("Inventory", "Purchase"), deleteGRN);

export default router;
