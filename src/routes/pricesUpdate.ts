import { Router } from "express";
import { 
  getCountries, 
  getRegions, 
  getCategories, 
  getAdminItems, 
  bulkUpdateItems,
  createCountry,
  createRegion,
  createCategory,
  deleteCategory,
  deleteCountry,
  deleteItem, 
  deleteRegion
} from "../controllers/adminPriceController";

const router = Router();

// GET Routes
router.get("/countries", getCountries);
router.get("/regions/:countryId", getRegions);
router.get("/categories/:masterListId", getCategories);
router.get("/items", getAdminItems);

// POST Routes (Ovo ti je falilo za kreiranje)
router.post("/countries", createCountry);
router.post("/regions", createRegion);
router.post("/categories", createCategory);
router.post("/items/bulk", bulkUpdateItems);

// Delete
router.delete("/countries/:id", deleteCountry);
router.delete("/regions/:id", deleteRegion);
router.delete("/categories/:id", deleteCategory);
router.delete("/items/:id", deleteItem);

export default router;