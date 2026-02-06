import { Request, Response } from "express";
import { db } from "../db";
import { countries, regions, priceCategories, priceItems, masterPriceLists } from "../db/schema";
import { eq, and, ilike, asc } from "drizzle-orm";

// --- GETTERS ---

export const getCountries = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await db.select().from(countries).orderBy(asc(countries.name));
    res.json(data);
  } catch (error) {
    console.error("[AdminPriceController] getCountries Error:", error);
    res.status(500).json({ error: "Failed to fetch countries" });
  }
};

export const getRegions = async (req: Request, res: Response): Promise<void> => {
  try {
    const countryId = Number(req.params.countryId);
    const data = await db.select().from(regions).where(eq(regions.countryId, countryId));
    res.json(data);
  } catch (error) {
    console.error("[AdminPriceController] getRegions Error:", error);
    res.status(500).json({ error: "Failed to fetch regions" });
  }
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const masterListId = Number(req.params.masterListId);
    const data = await db.select()
      .from(priceCategories)
      .where(eq(priceCategories.masterPriceListId, masterListId))
      .orderBy(asc(priceCategories.order));
    res.json(data);
  } catch (error) {
    console.error("[AdminPriceController] getCategories Error:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

export const getAdminItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const categoryId = Number(req.query.categoryId);
    const page = Number(req.query.page) || 1;
    const limit = 50;
    const offset = (page - 1) * limit;
    const search = (req.query.search as string) || "";

    if (!categoryId) {
      res.status(400).json({ error: "Category ID is required" });
      return;
    }

    const items = await db.select()
      .from(priceItems)
      .where(
        and(
          eq(priceItems.categoryId, categoryId),
          ilike(priceItems.description, `%${search}%`)
        )
      )
      .limit(limit)
      .offset(offset)
      .orderBy(asc(priceItems.id));

    res.json(items);
  } catch (error) {
    console.error("[AdminPriceController] getAdminItems Error:", error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
};

// --- CREATORS & UPDATERS ---

export const createCountry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, code } = req.body as { name: string; code: string };
    const [newCountry] = await db.insert(countries).values({ name, code }).returning();
    res.status(201).json(newCountry);
  } catch (error) {
    console.error("[AdminPriceController] createCountry Error:", error);
    res.status(500).json({ error: "Failed to create country" });
  }
};

export const createRegion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { countryId, name } = req.body as { countryId: number; name: string };
    
    await db.transaction(async (tx) => {
      const [newRegion] = await tx.insert(regions).values({ countryId, name }).returning();
      
      // Every region must have a Master Price List
      await tx.insert(masterPriceLists).values({
        name: `Master List - ${name}`,
        regionId: newRegion.id,
      });

      res.status(201).json(newRegion);
    });
  } catch (error) {
    console.error("[AdminPriceController] createRegion Error:", error);
    res.status(500).json({ error: "Failed to create region" });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { masterListId, name } = req.body as { masterListId: number; name: string };
    const [newCategory] = await db.insert(priceCategories).values({
      masterPriceListId: masterListId,
      name,
    }).returning();
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("[AdminPriceController] createCategory Error:", error);
    res.status(500).json({ error: "Failed to create category" });
  }
};

export const bulkUpdateItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { items } = req.body as { items: any[] }; // We use internal cast for safety

    await db.transaction(async (tx) => {
      for (const item of items) {
        if (item.id) {
          await tx.update(priceItems)
            .set({
              description: item.description,
              unit: item.unit,
              price: item.price,
            })
            .where(eq(priceItems.id, item.id));
        } else {
          await tx.insert(priceItems).values({
            categoryId: item.categoryId,
            description: item.description,
            unit: item.unit,
            price: item.price,
          });
        }
      }
    });

    res.json({ message: "Successfully updated items" });
  } catch (error) {
    console.error("[AdminPriceController] bulkUpdateItems Error:", error);
    res.status(500).json({ error: "Bulk update failed" });
  }
};

// Removers

export const deleteCountry = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await db.delete(countries).where(eq(countries.id, id));
    res.json({ message: "Country deleted successfully" });
  } catch (error) {
    console.error("[AdminPriceController] deleteCountry Error:", error);
    res.status(500).json({ error: "Failed to delete country" });
  }
};

export const deleteRegion = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await db.delete(regions).where(eq(regions.id, id));
    res.json({ message: "Region deleted successfully" });
  } catch (error) {
    console.error("[AdminPriceController] deleteRegion Error:", error);
    res.status(500).json({ error: "Failed to delete region" });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await db.delete(priceCategories).where(eq(priceCategories.id, id));
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("[AdminPriceController] deleteCategory Error:", error);
    res.status(500).json({ error: "Failed to delete category" });
  }
};

export const deleteItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await db.delete(priceItems).where(eq(priceItems.id, id));
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("[AdminPriceController] deleteItem Error:", error);
    res.status(500).json({ error: "Failed to delete item" });
  }
};