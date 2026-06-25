import { Schema, model, Document } from "mongoose";

export interface IPattern extends Document {
  name: string;
  description?: string;
  userId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PatternSchema = new Schema<IPattern>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

// Compound index to ensure uniqueness of pattern name per user
PatternSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Pattern = model<IPattern>("Pattern", PatternSchema);
export default Pattern;
