import { Request, Response } from "express";
import { db } from "../db";
import { workLogs, workers } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";

interface AuthenticatedRequest extends Request {
  user: { id: string; companyId: string; role: string };
}

export const workLogController = {
  createBulk: async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    try {
      const { projectId, date, entries } = req.body;
      const logsToInsert = await Promise.all(
        entries.map(async (entry: any) => {
          const worker = await db.query.workers.findFirst({
            where: eq(workers.id, entry.workerId),
          });
          return {
            companyId: authReq.user.companyId,
            projectId,
            workerId: entry.workerId,
            date: new Date(date),
            regularHours: entry.regularHours,
            overtimeHours: entry.overtimeHours,
            hourlyRateAtTime: worker?.hourlyRate || "0",
            status: "PENDING" as "PENDING" | "SETTLED",
          };
        })
      );
      const result = await db.insert(workLogs).values(logsToInsert).returning();
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: "Greška pri kreiranju", error });
    }
  },

  getPending: async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    try {
      const result = await db.query.workLogs.findMany({
        where: and(
          eq(workLogs.companyId, authReq.user.companyId),
          eq(workLogs.status, "PENDING")
        ),
        with: { worker: true, project: true }
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Greška pri dobavljanju", error });
    }
  },

  getAll: async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    try {
      const result = await db.query.workLogs.findMany({
        where: eq(workLogs.companyId, authReq.user.companyId),
        orderBy: [desc(workLogs.date)],
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Greška", error });
    }
  },

  update: async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const id = req.params.id as string; 
    try {
      const updated = await db.update(workLogs)
        .set(req.body)
        .where(and(eq(workLogs.id, id), eq(workLogs.companyId, authReq.user.companyId)))
        .returning();
      res.json(updated[0]);
    } catch (error) {
      res.status(500).json({ message: "Greška", error });
    }
  },

  getHistory: async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const result = await db.query.workLogs.findMany({
    where: and(
      eq(workLogs.companyId, authReq.user.companyId),
      eq(workLogs.status, "SETTLED")
    ),
    with: { worker: true, project: true },
    orderBy: [desc(workLogs.date)]
  });
  res.json(result);
},

  delete: async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const id = req.params.id as string; 
    try {
      await db.delete(workLogs).where(
        and(eq(workLogs.id, id), eq(workLogs.companyId, authReq.user.companyId))
      );
      res.json({ message: "Obrisano" });
    } catch (error) {
      res.status(500).json({ message: "Greška", error });
    }
  }
};