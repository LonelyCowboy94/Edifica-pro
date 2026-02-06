import { Router, Request, Response } from "express";
import { db } from "../db";
import { users, companies } from "../db/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { authenticate } from "../middleware/auth";

/**
 * Interface for requests handled by JWT authentication middleware
 */
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    companyId: string;
    role: string;
  };
}

export const authRouter = Router();

/**
 * POST /api/auth/register
 * Creates a new business entity and its primary owner
 */
authRouter.post("/register", async (req: Request, res: Response) => {
  const { companyName, email, password, country, tier, baseCurrency } = req.body;

  try {
    const result = await db.transaction(async (tx) => {
      // 1. Create the company
      const [newCompany] = await tx.insert(companies).values({
        name: companyName,
        tier: tier || "FREE", 
        country: country,
        baseCurrency: baseCurrency || "EUR"     
      }).returning();

      const hashedPassword = await bcrypt.hash(password, 10);

      // 2. Create the first user (Owner)
      const [newUser] = await tx.insert(users).values({
        email,
        password: hashedPassword,
        companyId: newCompany.id,
        role: "OWNER"
      }).returning();

      return { user: newUser, company: newCompany };
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Registration failed:", error); 
    res.status(500).json({ error: "Could not complete registration" });
  }
});

/**
 * POST /api/auth/login
 * Validates user credentials and issues a JWT token
 */
authRouter.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, companyId: user.companyId, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      }
    });
  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/auth/me
 * Fetches profile data using a Standard SQL Join to ensure strict type safety.
 * This bypasses the 'never' type inference issue with the relational builder.
 */
authRouter.get("/me", authenticate, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;

  try {
    // Using standard select with innerJoin for 100% type predictability
    const results = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        companyName: companies.name,
        baseCurrency: companies.baseCurrency,
      })
      .from(users)
      .innerJoin(companies, eq(users.companyId, companies.id))
      .where(eq(users.id, authReq.user.id));

    // Check if join returned a record
    const currentUser = results[0];

    if (!currentUser) {
      return res.status(404).json({ error: "User or company not found" });
    }

    // Explicitly send the typed result
    res.json(currentUser);

  } catch (error) {
    console.error("Profile retrieval error:", error);
    res.status(500).json({ error: "Internal server error fetching profile" });
  }
});

export default authRouter;