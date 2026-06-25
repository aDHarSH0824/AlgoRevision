import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
import logger from "../utils/logger";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
  } else if (err.code === 11000) {
    statusCode = 400;
    message = "Resource already exists (duplicate key error)";
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please authenticate again.";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired. Please authenticate again.";
  }

  if (statusCode === 500) {
    logger.error(`${req.method} ${req.originalUrl} - Error: ${err.message}\nStack: ${err.stack}`);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} - Status: ${statusCode} - ${message}`);
  }

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
    errors: err.errors || undefined,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export default errorMiddleware;
