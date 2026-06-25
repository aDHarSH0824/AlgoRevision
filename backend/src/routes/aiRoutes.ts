import { Router } from "express";
import { AIController } from "../controllers/AIController";
import { validate } from "../middlewares/validate";
import { aiPredictSchema, aiCoachSchema } from "../utils/validators";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const controller = new AIController();

router.use(authMiddleware as any);

router.post("/predict-pattern", validate(aiPredictSchema), controller.predictPattern as any);
router.get("/recommendations", controller.getRecommendations as any);
router.post("/generate-weekly-plan", controller.generateWeeklyPlan as any);
router.get("/weekly-plan", controller.getWeeklyPlan as any);
router.post("/coach-chat", validate(aiCoachSchema), controller.coachChat as any);

export default router;
