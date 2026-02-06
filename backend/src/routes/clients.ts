import { Router } from "express";
import { db } from "../db";
import { clients } from "../db/schema";
import { authenticate } from "../middleware/auth";
import { eq, and } from "drizzle-orm";

export const clientRouter = Router();

// GET
clientRouter.get("/", authenticate, async (req: any, res) => {
  const data = await db.select().from(clients).where(eq(clients.companyId, req.user.companyId));
  res.json(data);
});

// POST
clientRouter.post("/", authenticate, async (req: any, res) => {
  const { name, email, phone, address } = req.body;
  const [newClient] = await db.insert(clients).values({
    name, email, phone, address,
    companyId: req.user.companyId
  }).returning();
  res.status(201).json(newClient);
});

// PUT
clientRouter.put("/:id", authenticate, async (req: any, res) => {
  const { name, email, phone, address } = req.body;
  const updated = await db.update(clients)
    .set({ name, email, phone, address })
    .where(and(eq(clients.id, req.params.id), eq(clients.companyId, req.user.companyId)))
    .returning();
  res.json(updated[0]);
});

// DELETE
clientRouter.delete("/:id", authenticate, async (req: any, res) => {
  await db.delete(clients)
    .where(and(eq(clients.id, req.params.id), eq(clients.companyId, req.user.companyId)));
  res.json({ success: true });
});