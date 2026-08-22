import express from "express";
import { getDashboard } from "../controllers/dashboardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Aggregated metrics & chart data
 *     responses: { 200: { description: OK } }
 */
router.get("/", protect, getDashboard);

export default router;
