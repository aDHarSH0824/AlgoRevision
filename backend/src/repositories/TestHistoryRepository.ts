import { TestHistory, ITestHistory } from "../models/TestHistory";

export class TestHistoryRepository {
  async create(data: Partial<ITestHistory>): Promise<ITestHistory> {
    const testRecord = new TestHistory(data);
    return testRecord.save();
  }

  async findByUser(userId: string): Promise<ITestHistory[]> {
    return TestHistory.find({ userId }).sort({ createdAt: -1 });
  }
}
