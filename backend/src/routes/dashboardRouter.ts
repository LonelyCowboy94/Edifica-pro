import { Router } from "express";
import { dashboardController } from "../controllers/dashboardController";
import { authenticate } from "../middleware/auth";

// Using a specific name for the export to avoid conflicts in server.ts
export const dashboardRouter: Router = Router();

/**
 * GET /api/dashboard/stats
 * Protected route to fetch consolidated dashboard metrics
 */
dashboardRouter.get("/stats", authenticate, dashboardController.getStats);