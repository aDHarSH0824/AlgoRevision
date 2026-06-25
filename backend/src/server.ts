import dotenv from "dotenv";
// Initialize environment variables at the absolute entry point
dotenv.config();

import app from "./app";
import connectDB from "./config/db";
import logger from "./utils/logger";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Establish Database connection
  await connectDB();

  const server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  });

  // Safe process terminations on server crashes
  process.on("unhandledRejection", (err: Error) => {
    logger.error(`Unhandled Promise Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });

  process.on("uncaughtException", (err: Error) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

startServer();
