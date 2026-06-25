import { Router } from "express";
import { QuestionController } from "../controllers/QuestionController";
import { validate } from "../middlewares/validate";
import { questionSchema } from "../utils/validators";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const controller = new QuestionController();

router.use(authMiddleware as any);

router.get("/", controller.getQuestions as any);
router.post("/", validate(questionSchema), controller.createQuestion as any);
router.put("/:id", validate(questionSchema), controller.updateQuestion as any);
router.delete("/:id", controller.deleteQuestion as any);

export default router;
