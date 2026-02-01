import { Router } from "express";
import { db } from "../db";
import { workers } from "../db/schema";
import { authenticate } from "../middleware/auth";
import { eq, and } from "drizzle-orm";

export const workerRouter = Router();

/**
 * GET /workers
 * Retrieves all workers belonging to the authenticated user's company.
 */
workerRouter.get("/", authenticate, async (req: any, res) => {
  try {
    const data = await db.select()
      .from(workers)
      .where(eq(workers.companyId, req.user.companyId));
    
    res.json(data);
  } catch (error) {
    console.error("GET workers error:", error);
    res.status(500).json({ error: "Failed to fetch workers" });
  }
});

/**
 * POST /workers
 * Creates a new worker. Handles string-to-date conversion for Drizzle.
 */
workerRouter.post("/", authenticate, async (req: any, res) => {
  try {
    const { 
      firstName, lastName, email, position, 
      joinedAt, contractType, contractUntil, 
      bankAccount, hourlyRate, currency 
    } = req.body;

    // Convert date strings to JavaScript Date objects for Drizzle timestamp compatibility
    const formattedJoinedAt = joinedAt ? new Date(joinedAt) : new Date();
    const formattedContractUntil = contractUntil ? new Date(contractUntil) : null;

    const [newWorker] = await db.insert(workers).values({
      companyId: req.user.companyId,
      firstName,
      lastName,
      email,
      position,
      joinedAt: formattedJoinedAt,
      contractType,
      contractUntil: formattedContractUntil,
      bankAccount,
      hourlyRate,
      currency
    }).returning();

    res.status(201).json(newWorker);
  } catch (error) {
    console.error("POST worker error:", error);
    res.status(500).json({ error: "Failed to create worker" });
  }
});

/**
 * PUT /workers/:id
 * Updates an existing worker's data.
 */
workerRouter.put("/:id", authenticate, async (req: any, res) => {
  try {
    // 1. Destrukturiramo podatke tako da IZBACIMO id i companyId iz update objekta
    const { id, companyId, createdAt, ...updateData } = req.body;

    // 2. Konverzija datuma (samo za polja koja ostaju u updateData)
    if (updateData.joinedAt) {
      updateData.joinedAt = new Date(updateData.joinedAt);
    }

    if (updateData.contractType === "permanent") {
      updateData.contractUntil = null;
    } else if (updateData.contractUntil) {
      // Provera da string nije prazan pre konverzije
      updateData.contractUntil = new Date(updateData.contractUntil);
    }

    // 3. Izvršavanje update-a
    const updated = await db.update(workers)
      .set(updateData) // Šaljemo očišćene podatke bez ID-a
      .where(and(
        eq(workers.id, req.params.id), 
        eq(workers.companyId, req.user.companyId)
      ))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: "Worker not found or unauthorized" });
    }

    res.json(updated[0]);
  } catch (error) {
    // Ovo će ispisati tačan razlog u terminalu tvog backend-a
    console.error("PUT worker error details:", error);
    res.status(500).json({ error: "Failed to update worker" });
  }
});

/**
 * DELETE /workers/:id
 * Removes a worker from the system.
 */
workerRouter.delete("/:id", authenticate, async (req: any, res) => {
  try {
    const result = await db.delete(workers)
      .where(and(
        eq(workers.id, req.params.id), 
        eq(workers.companyId, req.user.companyId)
      ))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: "Worker not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("DELETE worker error:", error);
    res.status(500).json({ error: "Failed to delete worker" });
  }
});