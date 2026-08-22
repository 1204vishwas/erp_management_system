import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All user-management routes are Admin-only.
router.use(protect, authorize("Admin"));

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: List users (Admin) with search & pagination
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *   post:
 *     tags: [Users]
 *     summary: Create a user (Admin)
 *     responses:
 *       201: { description: Created }
 */
router.route("/").get(getUsers).post(createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   get: { tags: [Users], summary: Get a user, responses: { 200: { description: OK } } }
 *   put: { tags: [Users], summary: Update a user, responses: { 200: { description: Updated } } }
 *   delete: { tags: [Users], summary: Delete a user, responses: { 200: { description: Deleted } } }
 */
router
  .route("/:id")
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

export default router;
