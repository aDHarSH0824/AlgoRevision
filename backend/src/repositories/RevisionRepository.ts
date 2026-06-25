import { Types } from "mongoose";
import { RevisionHistory, IRevisionHistory } from "../models/RevisionHistory";

export class RevisionRepository {
  async createHistory(historyData: Partial<IRevisionHistory>): Promise<IRevisionHistory> {
    const history = new RevisionHistory(historyData);
    return history.save();
  }

  async findHistoryByUserId(userId: string, limit = 100): Promise<IRevisionHistory[]> {
    return RevisionHistory.find({ userId: new Types.ObjectId(userId) })
      .populate("questionId")
      .sort({ revisedAt: -1 })
      .limit(limit);
  }

  async getHeatmapData(userId: string, startDate: Date, endDate: Date): Promise<any[]> {
    return RevisionHistory.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          revisedAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$revisedAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async getWeakPatterns(userId: string): Promise<any[]> {
    return RevisionHistory.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "questions",
          localField: "questionId",
          foreignField: "_id",
          as: "question",
        },
      },
      { $unwind: "$question" },
      {
        $group: {
          _id: "$question.patternId",
          avgScore: {
            $avg: {
              $switch: {
                branches: [
                  { case: { $eq: ["$rating", "Forgot"] }, then: 0 },
                  { case: { $eq: ["$rating", "Hard Recall"] }, then: 1 },
                  { case: { $eq: ["$rating", "Easy Recall"] }, then: 2 },
                ],
                default: 1,
              },
            },
          },
          totalRevisions: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "patterns",
          localField: "_id",
          foreignField: "_id",
          as: "pattern",
        },
      },
      { $unwind: "$pattern" },
      { $sort: { avgScore: 1 } }, // Weakest (lowest average recall rating) first
    ]);
  }
}
export default RevisionRepository;
