import { Router } from "express";
import { db } from "../db";
import { users, companies } from "../db/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";

export const authRouter = Router();

// Company and owner registration
authRouter.post("/register", async (req, res) => {
  const { companyName, email, password } = req.body;

  try {
    const result = await db.transaction(async (tx) => {
      
      const [newCompany] = await tx.insert(companies).values({
        name: companyName,
        tier: "FREE"
      }).returning();

      const hashedPassword = await bcrypt.hash(password, 10);

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
    console.error("Registration error:", error); 
    res.status(500).json({ error: "Registration failed", details: error });
}
});

// LOGIN
authRouter.post("/login", async (req, res) => {
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
      { 
        id: user.id, 
        companyId: user.companyId, 
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" } // Token is valid 7 days
    );

    // Return token and user info
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
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});