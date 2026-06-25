import mongoose from "mongoose";
import logger from "../utils/logger";

export const connectDB = async (): Promise<void> => {
  try {
    const connStr = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/algorevision";
    await mongoose.connect(connStr);
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${(error as Error).message}`);
    process.exit(1);
  }
};

export default connectDB;
