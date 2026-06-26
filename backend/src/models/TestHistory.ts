import { Schema, model, Document } from "mongoose";

export interface ITestHistory extends Document {
  userId: Schema.Types.ObjectId;
  patterns: string[];
  questions: Array<{
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    platform: string;
    url: string;
    completed: boolean;
  }>;
  score: number;
  totalQuestions: number;
  timeTaken: number; // in seconds
  createdAt: Date;
}

const TestHistorySchema = new Schema<ITestHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    patterns: [{ type: String, required: true }],
    questions: [
      {
        title: { type: String, required: true },
        difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
        platform: { type: String, required: true },
        url: { type: String, required: true },
        completed: { type: Boolean, default: false },
      },
    ],
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    timeTaken: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const TestHistory = model<ITestHistory>("TestHistory", TestHistorySchema);
export default TestHistory;
