import express from "express";
import { body } from "express-validator";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

/**
 * @swagger
 * /api/customers:
 *   get: { tags: [Customers], summary: List customers, responses: { 200: { description: OK } } }
 *   post: { tags: [Customers], summary: Create customer, responses: { 201: { description: Created } } }
 */
router
  .route("/")
  .get(protect, getCustomers)
  .post(
    protect,
    authorize("Sales"),
    [body("name").notEmpty().withMessage("Name is required")],
    validate,
    createCustomer
  );

/**
 * @swagger
 * /api/customers/{id}:
 *   get: { tags: [Customers], summary: Get customer, responses: { 200: { description: OK } } }
 *   put: { tags: [Customers], summary: Update customer, responses: { 200: { description: Updated } } }
 *   delete: { tags: [Customers], summary: Delete customer, responses: { 200: { description: Deleted } } }
 */
router
  .route("/:id")
  .get(protect, getCustomerById)
  .put(protect, authorize("Sales"), updateCustomer)
  .delete(protect, authorize("Sales"), deleteCustomer);

export default router;
