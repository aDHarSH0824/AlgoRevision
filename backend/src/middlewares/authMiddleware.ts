import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/AuthService";
import { UnauthorizedError } from "../utils/errors";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

const authService = new AuthService();

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Access token is missing or invalid");
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = authService.verifyToken(token);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    throw new UnauthorizedError("Invalid or expired token");
  }
};

export default authMiddleware;
