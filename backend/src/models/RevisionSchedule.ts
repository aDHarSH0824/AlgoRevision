import { Schema, model, Document } from "mongoose";

export interface IRevisionSchedule extends Document {
  userId: Schema.Types.ObjectId;
  weeklyPlan: string;
  createdAt: Date;
  updatedAt: Date;
}

const RevisionScheduleSchema = new Schema<IRevisionSchedule>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    weeklyPlan: { type: String, required: true },
  },
  { timestamps: true }
);

export const RevisionSchedule = model<IRevisionSchedule>("RevisionSchedule", RevisionScheduleSchema);
export default RevisionSchedule;
