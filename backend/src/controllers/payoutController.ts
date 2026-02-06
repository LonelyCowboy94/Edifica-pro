import { Request, Response } from "express";
import { db } from "../db";
import { workLogs, workerPayouts, workers } from "../db/schema";
import { eq, and, inArray } from "drizzle-orm";

interface AuthenticatedRequest extends Request {
  user: { id: string; companyId: string; role: string };
}

export const payoutController = {
  settleWorker: async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const { workerId, note } = req.body;
    const companyId = authReq.user.companyId;

    if (typeof workerId !== "string") {
      res.status(400).json({ message: "Invalid workerId" });
      return;
    }

    try {
      await db.transaction(async (tx) => {
        const pendingLogs = await tx.select().from(workLogs).where(
          and(
            eq(workLogs.workerId, workerId),
            eq(workLogs.companyId, companyId),
            eq(workLogs.status, "PENDING")
          )
        );

        if (pendingLogs.length === 0) throw new Error("No pending logs");

        const workerRecord = await tx.query.workers.findFirst({
          where: eq(workers.id, workerId),
        });

        let totalRegular = 0;
        let totalOvertime = 0;
        let totalAmount = 0;
        const logIds: string[] = [];
        let minDate = pendingLogs[0].date;
        let maxDate = pendingLogs[0].date;

        pendingLogs.forEach((log) => {
          totalRegular += log.regularHours;
          totalOvertime += log.overtimeHours;
          totalAmount += (log.regularHours + log.overtimeHours) * Number(log.hourlyRateAtTime);
          logIds.push(log.id);
          if (log.date < minDate) minDate = log.date;
          if (log.date > maxDate) maxDate = log.date;
        });

        const [payout] = await tx.insert(workerPayouts).values({
          companyId,
          workerId,
          totalRegularHours: totalRegular,
          totalOvertimeHours: totalOvertime,
          totalAmount: totalAmount.toFixed(2),
          currency: workerRecord?.currency || "EUR",
          periodStart: minDate,
          periodEnd: maxDate,
          note,
        }).returning();

        await tx.update(workLogs)
          .set({ status: "SETTLED", payoutId: payout.id })
          .where(inArray(workLogs.id, logIds));
      });

      res.json({ message: "Payout successful" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error";
      res.status(400).json({ message });
    }
  },

  getHistory: async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    try {
      const result = await db.query.workerPayouts.findMany({
        where: eq(workerPayouts.companyId, authReq.user.companyId),
        with: { worker: true },
        orderBy: (payouts, { desc }) => [desc(payouts.paidAt)]
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Error" });
    }
  },

  voidPayout: async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const payoutId = req.params.id as string;
    const companyId = authReq.user.companyId;
    
    try {
      await db.transaction(async (tx) => {
        const existing = await tx.select().from(workerPayouts).where(
          and(eq(workerPayouts.id, payoutId), eq(workerPayouts.companyId, companyId))
        ).limit(1);

        if (existing.length === 0) throw new Error("Not found");

        await tx.update(workLogs)
          .set({ status: "PENDING", payoutId: null })
          .where(and(eq(workLogs.payoutId, payoutId), eq(workLogs.companyId, companyId)));

        await tx.delete(workerPayouts)
          .where(and(eq(workerPayouts.id, payoutId), eq(workerPayouts.companyId, companyId)));
      });
      res.json({ message: "Payout voided" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error";
      res.status(500).json({ message });
    }
  }
};