import { Request, Response } from "express";
import { db } from "../db";
import { workLogs, workers } from "../db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";

interface AuthenticatedRequest extends Request {
  user: { id: string; companyId: string; role: string };
}

export const workLogController = {
  createBulk: async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    try {
      const { projectId, date, entries } = req.body;
      const companyId = authReq.user.companyId;

      // 1. Povuci sve radnike firme da bi uzeo snapshot satnica
      const allWorkers = await db.query.workers.findMany({
        where: eq(workers.companyId, companyId),
      });

      // 2. Pripremi podatke i FILTRIRAJ radnike sa 0 sati
      const logsToInsert = entries
        .filter((entry: any) => entry.regularHours > 0 || entry.overtimeHours > 0)
        .map((entry: any) => {
          const worker = allWorkers.find((w) => w.id === entry.workerId);
          return {
            companyId,
            projectId,
            workerId: entry.workerId,
            date: new Date(date),
            regularHours: entry.regularHours,
            overtimeHours: entry.overtimeHours,
            hourlyRateAtTime: worker?.hourlyRate || "0",
            status: "PENDING" as const,
          };
        });

      if (logsToInsert.length === 0) {
        return res.status(400).json({ message: "Nema unosa sa satima većim od nule." });
      }

      // 3. Bulk insert u jednom upitu
      const result = await db.insert(workLogs).values(logsToInsert).returning();
      res.status(201).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Greška pri masovnom upisu", error });
    }
  },

  getAll: async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    try {
      const result = await db.query.workLogs.findMany({
        where: eq(workLogs.companyId, authReq.user.companyId),
        orderBy: [desc(workLogs.date)],
        with: {
          worker: true, // Ovo omogućava log.worker.firstName na frontendu
          project: true
        }
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Greška pri dobavljanju podataka", error });
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