import { Router } from "express";
import { projectController } from "../controllers/projectController";
import { authenticate } from "../middleware/auth";

export const projectRouter = Router();

// Create new project
projectRouter.post("/", authenticate, projectController.create);

// Get all projects with client names
projectRouter.get("/", authenticate, projectController.getAll);

// Get deep details and analytics for one project
projectRouter.get("/:id/details", authenticate, projectController.getDetails);

// Update project details
projectRouter.put("/:id", authenticate, projectController.update);

// Delete project (cascade work logs)
projectRouter.delete("/:id", authenticate, projectController.delete);