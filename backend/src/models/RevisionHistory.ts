import { Schema, model, Document } from "mongoose";

export interface IRevisionHistory extends Document {
  questionId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  rating: "Forgot" | "Hard Recall" | "Easy Recall";
  revisedAt: Date;
  nextInterval: number;
  createdAt: Date;
}

const RevisionHistorySchema = new Schema<IRevisionHistory>(
  {
    questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    rating: { type: String, enum: ["Forgot", "Hard Recall", "Easy Recall"], required: true },
    revisedAt: { type: Date, default: Date.now, index: true },
    nextInterval: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const RevisionHistory = model<IRevisionHistory>("RevisionHistory", RevisionHistorySchema);
export default RevisionHistory;
