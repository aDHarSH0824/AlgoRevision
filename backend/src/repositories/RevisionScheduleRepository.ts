import { RevisionSchedule, IRevisionSchedule } from "../models/RevisionSchedule";

export class RevisionScheduleRepository {
  async findByUserId(userId: string): Promise<IRevisionSchedule | null> {
    return RevisionSchedule.findOne({ userId });
  }

  async upsertWeeklyPlan(userId: string, weeklyPlan: string): Promise<IRevisionSchedule> {
    return RevisionSchedule.findOneAndUpdate(
      { userId },
      { weeklyPlan, updatedAt: new Date() },
      { upsert: true, new: true }
    ) as any;
  }
}

export default RevisionScheduleRepository;
