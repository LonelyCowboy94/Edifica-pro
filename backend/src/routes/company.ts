import { Router, Response } from "express";
import { db } from "../db";
import { companies, users } from "../db/schema";
import { authenticate, AuthUser } from "../middleware/auth";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { Request } from "express";

// Tip za request sa optional user
export type AuthenticatedRequest = Request & { user?: AuthUser };

export const companyRouter = Router();

// GET /company/settings
companyRouter.get("/settings", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const company = await db.query.companies.findFirst({
    where: eq(companies.id, req.user.companyId),
  });

  if (!company) return res.status(404).json({ message: "Company not found" });
  res.json(company);
});

// PUT /company/settings
companyRouter.put("/settings", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const { name, baseCurrency, logoUrl, defaultWeekdayHours, defaultWeekendHours } = req.body;

  const [updated] = await db.update(companies)
    .set({ name, baseCurrency, logoUrl, defaultWeekdayHours, defaultWeekendHours })
    .where(eq(companies.id, req.user.companyId))
    .returning();

  if (!updated) return res.status(404).json({ message: "Company not found" });
  res.json(updated);
});

// PUT /company/account
companyRouter.put("/account", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const { email, password, oldPassword } = req.body;

  const user = await db.query.users.findFirst({ where: eq(users.id, req.user.id) });
  if (!user) return res.status(404).json({ message: "User not found" });

  const updateData: any = {};
  if (email) updateData.email = email;
  if (password) {
    if (!oldPassword) return res.status(400).json({ message: "Old password required" });
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect old password" });
    updateData.password = await bcrypt.hash(password, 10);
  }

  await db.update(users).set(updateData).where(eq(users.id, req.user.id));
  res.json({ message: "Account updated successfully" });
});
