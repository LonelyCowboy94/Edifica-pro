import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { workers, companies } from "../db/schema";
import { eq, count } from "drizzle-orm";

const LIMITS = { FREE: 3, STANDARD: 10, PRO: 30, ENTERPRISE: 50 };

export const checkTierLimit = async (req: any, res: Response, next: NextFunction) => {
  const companyId = req.user.companyId;

  // Dohvati firmu da vidiš koji je paket
  const [company] = await db.select().from(companies).where(eq(companies.id, companyId));
  
  // Izbroj radnike
  const [workerCount] = await db.select({ value: count() }).from(workers).where(eq(workers.companyId, companyId));

  if (workerCount.value >= LIMITS[company.tier as keyof typeof LIMITS]) {
    return res.status(403).json({ 
      error: "LIMIT_REACHED",
      message: "Dostigli ste limit radnika za vaš paket." 
    });
  }
  next();
};