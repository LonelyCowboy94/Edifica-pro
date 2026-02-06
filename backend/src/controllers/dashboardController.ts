import { Request, Response } from "express";
import { db } from "../db";
import { projects, workLogs, workers, companies } from "../db/schema";
import { eq, and, sql, desc, gte, lte } from "drizzle-orm";
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from "date-fns";

// Strict interface for Authenticated Request
interface AuthenticatedRequest extends Request {
  user: { id: string; companyId: string; role: string };
}

export const dashboardController = {
  getStats: async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const companyId = authReq.user.companyId;

    try {
      // 1. Counters
      const [pCount] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(projects).where(eq(projects.companyId, companyId));
      const [wCount] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(workers).where(eq(workers.companyId, companyId));

      // 2. Pending debt calculation
      const pendingLogs = await db.select().from(workLogs).where(and(eq(workLogs.companyId, companyId), eq(workLogs.status, "PENDING")));
      const totalPendingCost = pendingLogs.reduce((sum, log) => sum + (log.regularHours + log.overtimeHours) * Number(log.hourlyRateAtTime), 0);

      // 3. Chart Data Logic (Current Month)
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const monthlyLogs = await db.query.workLogs.findMany({
        where: and(
          eq(workLogs.companyId, companyId),
          gte(workLogs.date, monthStart),
          lte(workLogs.date, monthEnd)
        )
      });

      // Map interval to daily totals with EXPLICIT TYPES
      const days: Date[] = eachDayOfInterval({ start: monthStart, end: now });
      
      const chartData = days.map((day: Date) => {
        const dayStr = format(day, "yyyy-MM-dd");
        
        // Filter logs for this specific day
        const logsOnDay = monthlyLogs.filter((l) => 
          format(new Date(l.date), "yyyy-MM-dd") === dayStr
        );
        
        return {
          date: dayStr,
          cost: logsOnDay.reduce((sum, l) => sum + (l.regularHours + l.overtimeHours) * Number(l.hourlyRateAtTime), 0),
          hours: logsOnDay.reduce((sum, l) => sum + (l.regularHours + l.overtimeHours), 0)
        };
      });

      // 4. Activity and Company Info
      const recentActivity = await db.query.workLogs.findMany({
        where: eq(workLogs.companyId, companyId),
        limit: 5,
        orderBy: [desc(workLogs.createdAt)],
        with: { worker: true, project: true }
      });

      const company = await db.query.companies.findFirst({ where: eq(companies.id, companyId) });

      res.json({
        stats: {
          activeProjects: pCount?.count || 0,
          totalWorkers: wCount?.count || 0,
          pendingLaborCost: totalPendingCost,
          baseCurrency: company?.baseCurrency || "EUR",
        },
        recentLogs: recentActivity,
        chartData
      });
    } catch (error) {
      console.error("Dashboard Stats Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};