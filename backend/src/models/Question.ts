import { Schema, model, Document } from "mongoose";

export interface IQuestion extends Document {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  platform: "LeetCode" | "HackerRank" | "GeeksforGeeks" | "Codeforces" | "Custom";
  url?: string;
  notes?: string;
  patternId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  revisionCount: number;
  lastRevisedAt?: Date;
  nextRevisionAt: Date;
  easeFactor: number;
  interval: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    title: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    platform: {
      type: String,
      enum: ["LeetCode", "HackerRank", "GeeksforGeeks", "Codeforces", "Custom"],
      default: "Custom",
    },
    url: { type: String, trim: true },
    notes: { type: String },
    patternId: { type: Schema.Types.ObjectId, ref: "Pattern", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    revisionCount: { type: Number, default: 0 },
    lastRevisedAt: { type: Date },
    nextRevisionAt: { type: Date, default: Date.now, index: true },
    easeFactor: { type: Number, default: 2.5 },
    interval: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Optimize database queries for dashboard metrics and active revision queues
QuestionSchema.index({ userId: 1, nextRevisionAt: 1 });
QuestionSchema.index({ userId: 1, patternId: 1 });

export const Question = model<IQuestion>("Question", QuestionSchema);
export default Question;
