import { Router, Request, Response } from "express";
import { db } from "../db";
import { 
  clientPriceLists, 
  clientPriceCategories, 
  clientPriceItems, 
  priceCategories, 
  priceItems 
} from "../db/schema";
import { eq, and } from "drizzle-orm";
import { authenticate } from "../middleware/auth";

export const clientPriceRouter = Router();

// 1. GET ALL LISTS
clientPriceRouter.get("/", authenticate, async (req: Request, res: Response) => {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Missing company ID" });
  try {
    const lists = await db.select().from(clientPriceLists).where(eq(clientPriceLists.companyId, companyId));
    res.json(lists);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch lists" });
  }
});

// 2. CREATE EMPTY LIST
clientPriceRouter.post("/", authenticate, async (req: Request, res: Response) => {
  const { name } = req.body;
  const companyId = req.user?.companyId;
  try {
    const [newList] = await db.insert(clientPriceLists).values({
      companyId: companyId!,
      name: name || "Novi Cenovnik",
      isActive: false
    }).returning();
    res.status(201).json(newList);
  } catch (error) {
    res.status(500).json({ error: "Failed to create list" });
  }
});

// CREATE CATEGORY FOR CLIENT LIST
clientPriceRouter.post("/:id/categories", authenticate, async (req: Request, res: Response) => {
  const { id } = req.params; // listId
  const { name } = req.body;

  try {
    const [newCategory] = await db.insert(clientPriceCategories).values({
      clientPriceListId: parseInt(id as string),
      name: name,
      order: 0
    }).returning();
    
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ error: "Failed to create category" });
  }
});

// 3. IMPORT FROM MASTER
clientPriceRouter.post("/import", authenticate, async (req: Request, res: Response) => {
  const { masterListId, name } = req.body;
  const companyId = req.user?.companyId;
  try {
    const result = await db.transaction(async (tx) => {
      const [newList] = await tx.insert(clientPriceLists).values({
        companyId: companyId!,
        name: name || "Imported List",
        isActive: false
      }).returning();

      const masterCats = await tx.select().from(priceCategories).where(eq(priceCategories.masterPriceListId, masterListId));
      for (const mCat of masterCats) {
        const [newCCat] = await tx.insert(clientPriceCategories).values({
          clientPriceListId: newList.id,
          name: mCat.name,
          order: mCat.order ?? 0
        }).returning();

        const mItems = await tx.select().from(priceItems).where(eq(priceItems.categoryId, mCat.id));
        if (mItems.length > 0) {
          await tx.insert(clientPriceItems).values(
            mItems.map(mi => ({
              categoryId: newCCat.id,
              description: mi.description,
              unit: mi.unit,
              price: mi.price,
              currency: mi.currency ?? "EUR"
            }))
          );
        }
      }
      return newList;
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: "Import failed" });
  }
});

// 4. GET CATEGORIES
clientPriceRouter.get("/:id/categories", authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const categories = await db.select().from(clientPriceCategories)
      .where(eq(clientPriceCategories.clientPriceListId, parseInt(id as string)));
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// 5. GET ITEMS (ZA KLIJENTSKU TABELU)
clientPriceRouter.get("/categories/:categoryId/items", authenticate, async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  try {
    const items = await db.select().from(clientPriceItems)
      .where(eq(clientPriceItems.categoryId, parseInt(categoryId as string)));
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch client items" });
  }
});

// 6. BULK UPDATE ITEMS
clientPriceRouter.post("/items/bulk", authenticate, async (req: Request, res: Response) => {
  const { items } = req.body;
  try {
    await db.transaction(async (tx) => {
      for (const item of items) {
        if (item.id) {
          await tx.update(clientPriceItems).set(item).where(eq(clientPriceItems.id, item.id));
        } else {
          await tx.insert(clientPriceItems).values(item);
        }
      }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to save items" });
  }
});

// 7. SET ACTIVE
clientPriceRouter.patch("/:id/set-active", authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  const companyId = req.user?.companyId;
  try {
    await db.transaction(async (tx) => {
      await tx.update(clientPriceLists).set({ isActive: false }).where(eq(clientPriceLists.companyId, companyId!));
      await tx.update(clientPriceLists).set({ isActive: true }).where(eq(clientPriceLists.id, parseInt(id as string)));
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to set active" });
  }
});

// 8. DELETE LIST
clientPriceRouter.delete("/:id", authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  const companyId = req.user?.companyId;
  try {
    await db.delete(clientPriceLists).where(
      and(
        eq(clientPriceLists.id, parseInt(id as string)),
        eq(clientPriceLists.companyId, companyId!)
      )
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
});