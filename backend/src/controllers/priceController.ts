// backend/src/controllers/priceController.ts

import { db } from "../db";
import { clientPriceLists, clientPriceCategories, clientPriceItems, masterPriceLists, priceCategories, priceItems } from "../db/schema";
import { eq } from "drizzle-orm";

export const cloneMasterToClient = async (
  companyId: string, 
  masterListId: number, 
  customName: string
) => {
  return await db.transaction(async (tx) => {
    // 1. Create the Client Price List Header
    const [newList] = await tx.insert(clientPriceLists).values({
      companyId,
      name: customName,
      isActive: false
    }).returning();

    // 2. Fetch all Master Categories
    const masterCats = await tx.select()
      .from(priceCategories)
      .where(eq(priceCategories.masterPriceListId, masterListId));

    for (const masterCat of masterCats) {
      // 3. Insert Client Category
      const [newClientCat] = await tx.insert(clientPriceCategories).values({
        clientPriceListId: newList.id,
        name: masterCat.name,
        order: masterCat.order ?? 0
      }).returning();

      // 4. Fetch Master Items for this category
      const masterItems = await tx.select()
        .from(priceItems)
        .where(eq(priceItems.categoryId, masterCat.id));

      if (masterItems.length > 0) {
        // 5. Bulk Insert Items into the new Client Category
        await tx.insert(clientPriceItems).values(
          masterItems.map(item => ({
            categoryId: newClientCat.id,
            description: item.description,
            unit: item.unit,
            price: item.price,
            currency: item.currency
          }))
        );
      }
    }

    return newList;
  });
};