import { Types } from "mongoose";
import { Question, IQuestion } from "../models/Question";

export class QuestionRepository {
  async findById(id: string): Promise<IQuestion | null> {
    return Question.findById(id).populate("patternId");
  }

  async findByUserId(
    userId: string,
    filters: {
      patternId?: string;
      difficulty?: string;
      search?: string;
      limit?: number;
      skip?: number;
    }
  ): Promise<{ questions: IQuestion[]; total: number }> {
    const query: any = { userId: new Types.ObjectId(userId) };

    if (filters.patternId) {
      query.patternId = new Types.ObjectId(filters.patternId);
    }
    if (filters.difficulty) {
      query.difficulty = filters.difficulty;
    }
    if (filters.search) {
      query.title = { $regex: filters.search, $options: "i" };
    }

    const total = await Question.countDocuments(query);
    const questions = await Question.find(query)
      .populate("patternId")
      .sort({ createdAt: -1 })
      .skip(filters.skip || 0)
      .limit(filters.limit || 50);

    return { questions, total };
  }

  async findForRevision(
    userId: string,
    options: {
      limit: number;
      patternIds?: string[];
      difficulties?: string[];
    }
  ): Promise<IQuestion[]> {
    const query: any = { userId: new Types.ObjectId(userId) };

    if (options.patternIds && options.patternIds.length > 0) {
      query.patternId = { $in: options.patternIds.map((id) => new Types.ObjectId(id)) };
    }
    if (options.difficulties && options.difficulties.length > 0) {
      query.difficulty = { $in: options.difficulties };
    }

    const now = new Date();
    // Prioritize due questions
    const dueQuery = { ...query, nextRevisionAt: { $lte: now } };
    let questions = await Question.find(dueQuery)
      .populate("patternId")
      .sort({ nextRevisionAt: 1, easeFactor: 1 })
      .limit(options.limit);

    if (questions.length < options.limit) {
      const remainingLimit = options.limit - questions.length;
      const excludedIds = questions.map((q) => q._id);
      const futureQuestions = await Question.find({
        ...query,
        _id: { $nin: excludedIds },
      })
        .populate("patternId")
        .sort({ nextRevisionAt: 1 })
        .limit(remainingLimit);

      questions = [...questions, ...futureQuestions];
    }

    return questions;
  }

  async create(questionData: Partial<IQuestion>): Promise<IQuestion> {
    const question = new Question(questionData);
    return question.save();
  }

  async update(id: string, userId: string, questionData: Partial<IQuestion>): Promise<IQuestion | null> {
    return Question.findOneAndUpdate(
      { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) },
      questionData,
      { new: true }
    );
  }

  async delete(id: string, userId: string): Promise<IQuestion | null> {
    return Question.findOneAndDelete({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return Question.countDocuments({ userId: new Types.ObjectId(userId) });
  }

  async getStatsByPattern(userId: string): Promise<any[]> {
    return Question.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$patternId",
          count: { $sum: 1 },
          easyCount: { $sum: { $cond: [{ $eq: ["$difficulty", "Easy"] }, 1, 0] } },
          mediumCount: { $sum: { $cond: [{ $eq: ["$difficulty", "Medium"] }, 1, 0] } },
          hardCount: { $sum: { $cond: [{ $eq: ["$difficulty", "Hard"] }, 1, 0] } },
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
    ]);
  }

  async deleteManyByPatternId(patternId: string, userId: string): Promise<void> {
    await Question.deleteMany({
      patternId: new Types.ObjectId(patternId),
      userId: new Types.ObjectId(userId),
    });
  }
}
export default QuestionRepository;
