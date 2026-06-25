import { Router } from "express";
import { RevisionController } from "../controllers/RevisionController";
import { validate } from "../middlewares/validate";
import { revisionSubmitSchema, revisionGenerateSchema } from "../utils/validators";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const controller = new RevisionController();

router.use(authMiddleware as any);

router.post("/generate", validate(revisionGenerateSchema), controller.generateRevisionSet as any);
router.post("/submit/:questionId", validate(revisionSubmitSchema), controller.submitRevision as any);
router.get("/heatmap", controller.getHeatmap as any);
router.get("/stats", controller.getDashboardStats as any);

export default router;
