import { Router } from "express";
import { db } from "../db";
import { projects, clients } from "../db/schema";
import { authenticate } from "../middleware/auth";
import { eq, and } from "drizzle-orm";

export const projectRouter = Router();

// GET
projectRouter.get("/", authenticate, async (req: any, res) => {
  try {
    const data = await db
      .select({
        id: projects.id,
        name: projects.name,
        status: projects.status,
        createdAt: projects.createdAt,
        clientName: clients.name, 
      })
      .from(projects)
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .where(eq(projects.companyId, req.user.companyId));
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// POST 
projectRouter.post("/", authenticate, async (req: any, res) => {
  const { name, clientId, status } = req.body;

  try {
    const [newProject] = await db.insert(projects).values({
      name,
      clientId,
      status: status || "OPEN",
      companyId: req.user.companyId
    }).returning();

    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ error: "Failed to create project" });
  }
});

// DELETE 
projectRouter.delete("/:id", authenticate, async (req: any, res) => {
  try {
    await db.delete(projects).where(
      and(
        eq(projects.id, req.params.id),
        eq(projects.companyId, req.user.companyId) // Only from your company
      )
    );
    res.json({ message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
});