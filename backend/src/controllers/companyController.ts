import { Request, Response } from "express";
import { db } from "../db";
import { companies, users } from "../db/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

interface AuthenticatedRequest extends Request {
  user: { id: string; companyId: string; role: string };
}

export const companyController = {
  getSettings: async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    try {
      const company = await db.query.companies.findFirst({
        where: eq(companies.id, authReq.user.companyId),
      });
      if (!company) throw new Error("Company not found");
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Error fetching settings" });
    }
  },

  updateSettings: async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const data = req.body;
    try {
      const [updated] = await db
        .update(companies)
        .set({
          name: data.name,
          baseCurrency: data.baseCurrency,
          logoUrl: data.logoUrl,
          defaultWeekdayHours: data.defaultWeekdayHours,
          defaultWeekendHours: data.defaultWeekendHours,
        })
        .where(eq(companies.id, authReq.user.companyId))
        .returning();
      
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Update failed" });
    }
  },

  updateAccount: async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const { email, password, oldPassword } = req.body;
    const userId = authReq.user.id;

    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) throw new Error("User not found");

      const updateData: any = {};
      if (email) updateData.email = email;

      if (password) {
        if (!oldPassword) throw new Error("Old password required");
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) throw new Error("Incorrect old password");
        updateData.password = await bcrypt.hash(password, 10);
      }

      await db.update(users)
        .set(updateData)
        .where(eq(users.id, userId));

      res.json({ message: "Account updated successfully" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error";
      res.status(400).json({ message });
    }
  }
};