import { Request, Response } from "express";
import { db } from "../db";
import { projects, workLogs } from "../db/schema"; // Dodat workLogs import
import { eq, and, desc } from "drizzle-orm";

// Interface for authenticated request
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    companyId: string;
    role: string;
  };
}

export const projectController = {
  // 1. Create project linked to a client
  create: async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const { name, clientId, status } = authReq.body;
    try {
      const [newProject] = await db.insert(projects).values({
        name,
        clientId: clientId || null,
        status: status || "OPEN",
        companyId: authReq.user.companyId,
      }).returning();
      res.status(201).json(newProject);
    } catch (error) {
      res.status(500).json({ message: "Error creating project" });
    }
  },

  // 2. List all projects with client data (using relations)
  getAll: async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    try {
      const result = await db.query.projects.findMany({
        where: eq(projects.companyId, authReq.user.companyId),
        with: {
          client: true,
        },
        orderBy: [desc(projects.createdAt)]
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Error fetching projects" });
    }
  },

  // 3. GET PROJECT DETAILS (Full analytics, workers, and history)
  getDetails: async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const projectId = req.params.id as string; // Casting to string

    try {
      const projectData = await db.query.projects.findFirst({
        where: and(
          eq(projects.id, projectId),
          eq(projects.companyId, authReq.user.companyId)
        ),
        with: {
          client: true,
          workLogs: {
            with: {
              worker: true
            },
            orderBy: [desc(workLogs.date)]
          }
        }
      });

      if (!projectData) return res.status(404).json({ message: "Project not found" });

      // Backend calculation for analytics
      const stats = projectData.workLogs.reduce((acc, log) => {
        const workerId = log.workerId;
        const totalHours = log.regularHours + log.overtimeHours;
        const cost = totalHours * Number(log.hourlyRateAtTime);

        if (!acc.workers[workerId]) {
          acc.workers[workerId] = {
            name: `${log.worker?.firstName} ${log.worker?.lastName}`,
            totalHours: 0,
            totalCost: 0
          };
        }
        acc.workers[workerId].totalHours += totalHours;
        acc.workers[workerId].totalCost += cost;
        acc.totalHours += totalHours;
        acc.totalCost += cost;
        return acc;
      }, { totalHours: 0, totalCost: 0, workers: {} as any });

      res.json({
        ...projectData,
        analytics: stats
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching project details" });
    }
  },

  // 4. Update project
  update: async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const projectId = req.params.id as string; // Fixes overload error 2769
    
    try {
      const updated = await db.update(projects)
        .set(authReq.body)
        .where(and(
          eq(projects.id, projectId),
          eq(projects.companyId, authReq.user.companyId)
        ))
        .returning();

      if (updated.length === 0) return res.status(404).json({ message: "Project not found" });
      res.json(updated[0]);
    } catch (error) {
      res.status(500).json({ message: "Update failed" });
    }
  },

  // 5. Delete project (Cascade delete handled by DB schema)
  delete: async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const projectId = req.params.id as string;
    
    try {
      const deleted = await db.delete(projects)
        .where(and(
          eq(projects.id, projectId),
          eq(projects.companyId, authReq.user.companyId)
        ))
        .returning();

      if (deleted.length === 0) return res.status(404).json({ message: "Project not found" });
      res.json({ success: true, message: "Project and its logs deleted" });
    } catch (error: any) {
      res.status(500).json({ error: "Delete failed", details: error.message });
    }
  }
};