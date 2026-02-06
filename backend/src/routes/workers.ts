import { Router } from "express";
import { db } from "../db";
import { workers } from "../db/schema";
import { authenticate } from "../middleware/auth";
import { eq, and } from "drizzle-orm";

export const workerRouter = Router();


// GET workers

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


// POST workers
 
workerRouter.post("/", authenticate, async (req: any, res) => {
  try {
    const { 
      firstName, lastName, email, 
      phone,
      position, joinedAt, contractType, contractUntil, 
      bankAccount, hourlyRate, currency 
    } = req.body;

    const formattedJoinedAt = joinedAt ? new Date(joinedAt) : new Date();
    const formattedContractUntil = contractUntil ? new Date(contractUntil) : null;

    const [newWorker] = await db.insert(workers).values({
      companyId: req.user.companyId,
      firstName,
      lastName,
      email,
      phone, 
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

// PUT /workers/:id
 
workerRouter.put("/:id", authenticate, async (req: any, res) => {
  try {
    // 1. Destructure data and REMOVE id and companyId from the update object
    const { id, companyId, createdAt, ...updateData } = req.body;

    // 2. Date conversion (only for fields that remain in updateData)
    if (updateData.joinedAt) {
      updateData.joinedAt = new Date(updateData.joinedAt);
    }

    if (updateData.contractType === "permanent") {
      updateData.contractUntil = null;
    } else if (updateData.contractUntil) {
      // Check that the string is not empty before conversion
      updateData.contractUntil = new Date(updateData.contractUntil);
    }

    // 3. Execute update
    const updated = await db.update(workers)
      .set(updateData) // Send sanitized data without ID
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
    // This will print the exact error reason in your backend terminal
    console.error("PUT worker error details:", error);
    res.status(500).json({ error: "Failed to update worker" });
  }
});


// DELETE /workers/:id

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
