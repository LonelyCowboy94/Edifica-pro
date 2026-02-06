import { Request, Response } from "express";
import { db } from "../db";
import { workLogs, workerPayouts } from "../db/schema";
import { eq, and } from "drizzle-orm";

interface AuthenticatedRequest extends Request {
  user: { id: string; companyId: string; role: string };
}

export const payoutController = {
  settleWorker: async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const { workerId, note } = req.body;
    const companyId = authReq.user.companyId;

    try {
      await db.transaction(async (tx) => {
        const pendingLogs = await tx.select().from(workLogs).where(
          and(
            eq(workLogs.workerId, workerId),
            eq(workLogs.companyId, companyId),
            eq(workLogs.status, "PENDING")
          )
        );

        if (pendingLogs.length === 0) {
          throw new Error("Nema neizmirenih sati za ovog radnika");
        }

        let totalRegular = 0;
        let totalOvertime = 0;
        let totalAmount = 0;

        pendingLogs.forEach((log) => {
          totalRegular += log.regularHours;
          totalOvertime += log.overtimeHours;
          totalAmount += (log.regularHours + log.overtimeHours) * Number(log.hourlyRateAtTime);
        });

        const [payout] = await tx.insert(workerPayouts).values({
          companyId,
          workerId,
          totalRegularHours: totalRegular,
          totalOvertimeHours: totalOvertime,
          totalAmount: totalAmount.toFixed(2), 
          periodStart: pendingLogs[0].date,
          periodEnd: new Date(),
          note,
        }).returning();

        await tx.update(workLogs)
          .set({ 
            status: "SETTLED",
            payoutId: payout.id 
          })
          .where(and(
            eq(workLogs.workerId, workerId),
            eq(workLogs.status, "PENDING"),
            eq(workLogs.companyId, companyId)
          ));
      });

      res.json({ message: "Isplata uspešno proknjižena" });
    } catch (error: any) {
      console.error(error);
      res.status(400).json({ message: error.message || "Greška pri obračunu isplate" });
    }
  },

  getHistory: async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    try {
      const result = await db.query.workerPayouts.findMany({
        where: eq(workerPayouts.companyId, authReq.user.companyId),
      
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Greška pri dobavljanju istorije", error });
    }
  },

  voidPayout: async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const companyId = authReq.user.companyId;
    
    try {
      await db.transaction(async (tx) => {
        const existingPayout = await tx.select().from(workerPayouts).where(
          and(
            eq(workerPayouts.id, id),
            eq(workerPayouts.companyId, companyId)
          )
        ).limit(1);

        if (existingPayout.length === 0) {
          throw new Error("Isplata nije pronađena ili nemate pristup.");
        }

        await tx
          .update(workLogs)
          .set({ status: "PENDING", payoutId: null })
          .where(and(
            eq(workLogs.payoutId, id),
            eq(workLogs.companyId, companyId)
          ));

        await tx
          .delete(workerPayouts)
          .where(
            and(
              eq(workerPayouts.id, id),
              eq(workerPayouts.companyId, companyId)
            )
          );
      });
      res.json({ message: "Isplata uspešno poništena i sati vraćeni na obračun" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Greška pri poništavanju" });
    }
  }
};