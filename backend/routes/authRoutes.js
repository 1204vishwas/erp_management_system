import express from "express";
import { body } from "express-validator";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

/**
 * @swagger
 * /api/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [Sales, Purchase, Inventory] }
 *     responses:
 *       201: { description: Registered }
 */
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validate,
  registerUser
);

/**
 * @swagger
 * /api/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and receive a JWT
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Authenticated }
 *       401: { description: Invalid credentials }
 */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  loginUser
);

/**
 * @swagger
 * /api/profile:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user's profile
 *     responses:
 *       200: { description: OK }
 *   put:
 *     tags: [Auth]
 *     summary: Update current user's profile
 *     responses:
 *       200: { description: Updated }
 */
router
  .route("/profile")
  .get(protect, getProfile)
  .put(protect, updateProfile);

export default router;
