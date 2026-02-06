import { Router } from "express";
import { workLogController } from "../controllers/workLogController";
import { payoutController } from "../controllers/payoutController"; 
import { authenticate } from "../middleware/auth";

const router = Router();

// Karnet
router.post("/work-logs/bulk", authenticate, workLogController.createBulk);
router.get("/work-logs", authenticate, workLogController.getAll);
router.get("/work-logs/pending", authenticate, workLogController.getPending);
router.put("/work-logs/:id", authenticate, workLogController.update);
router.delete("/work-logs/:id", authenticate, workLogController.delete);

// Isplate
router.post("/payouts/settle", authenticate, payoutController.settleWorker);
router.get("/payouts/history", authenticate, payoutController.getHistory);
router.delete("/payouts/:id", authenticate, payoutController.voidPayout);

export default router;