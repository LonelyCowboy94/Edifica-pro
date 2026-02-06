import { Request, Response } from "express";
import { db } from "../db";
import { projects, workLogs, companies } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    companyId: string;
    role: string;
  };
}

export const projectController = {
  // Create a new project
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

  // List all projects with client data
  getAll: async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    try {
      const result = await db.query.projects.findMany({
        where: eq(projects.companyId, authReq.user.companyId),
        with: { client: true },
        orderBy: [desc(projects.createdAt)]
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Error fetching projects" });
    }
  },

  // Get deep details, analytics and company currency
  getDetails: async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const projectId = req.params.id as string;

    try {
      // 1. Fetch project data with logs and worker relations
      const projectData = await db.query.projects.findFirst({
        where: and(
          eq(projects.id, projectId),
          eq(projects.companyId, authReq.user.companyId)
        ),
        with: {
          client: true,
          workLogs: {
            with: { worker: true },
            orderBy: [desc(workLogs.date)]
          }
        }
      });

      // 2. Fetch company to get baseCurrency
      const companyData = await db.query.companies.findFirst({
        where: eq(companies.id, authReq.user.companyId)
      });

      if (!projectData) return res.status(404).json({ message: "Project not found" });

      // 3. Aggregate analytics including full worker metadata for the frontend table
      const stats = projectData.workLogs.reduce((acc, log) => {
        const workerId = log.workerId;
        const totalHours = log.regularHours + log.overtimeHours;
        const cost = totalHours * Number(log.hourlyRateAtTime);

        if (!acc.workers[workerId]) {
          acc.workers[workerId] = {
            firstName: log.worker?.firstName || "N/A",
            lastName: log.worker?.lastName || "N/A",
            position: log.worker?.position || "N/A",
            currency: log.worker?.currency || "EUR",
            totalHours: 0,
            totalCost: 0
          };
        }
        
        acc.workers[workerId].totalHours += totalHours;
        acc.workers[workerId].totalCost += cost;
        acc.totalHours += totalHours;
        acc.totalCost += cost;
        
        return acc;
      }, { 
        totalHours: 0, 
        totalCost: 0, 
        workers: {} as Record<string, any> 
      });

      res.json({
        ...projectData,
        baseCurrency: companyData?.baseCurrency || "EUR",
        analytics: stats
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching project details" });
    }
  },

  // Update project details
  update: async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const projectId = req.params.id as string;
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

  // Delete project and cascade logs
  delete: async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const projectId = req.params.id as string;
    try {
      await db.delete(projects).where(and(
        eq(projects.id, projectId),
        eq(projects.companyId, authReq.user.companyId)
      ));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Delete failed" });
    }
  }
};