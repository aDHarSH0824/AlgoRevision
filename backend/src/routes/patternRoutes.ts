import { Router } from "express";
import { PatternController } from "../controllers/PatternController";
import { validate } from "../middlewares/validate";
import { patternSchema } from "../utils/validators";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const controller = new PatternController();

router.use(authMiddleware as any);

router.get("/", controller.getPatterns as any);
router.post("/", validate(patternSchema), controller.createPattern as any);
router.put("/:id", validate(patternSchema), controller.updatePattern as any);
router.delete("/:id", controller.deletePattern as any);

export default router;
