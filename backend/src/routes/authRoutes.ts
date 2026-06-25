import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { validate } from "../middlewares/validate";
import { authLimiter } from "../middlewares/rateLimiter";
import { registerSchema, loginSchema } from "../utils/validators";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const controller = new AuthController();

router.post("/register", authLimiter, validate(registerSchema), controller.register);
router.post("/login", authLimiter, validate(loginSchema), controller.login);
router.post("/google", authLimiter, controller.googleLogin);
router.get("/me", authMiddleware as any, controller.getMe as any);

export default router;
