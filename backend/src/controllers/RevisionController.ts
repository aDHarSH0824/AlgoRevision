import { Response, NextFunction } from "express";
import { QuestionRepository } from "../repositories/QuestionRepository";
import { RevisionRepository } from "../repositories/RevisionRepository";
import { TestHistoryRepository } from "../repositories/TestHistoryRepository";
import { SpacedRepetitionService } from "../services/SpacedRepetitionService";
import { NotFoundError } from "../utils/errors";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { Question } from "../models/Question";

const questionRepository = new QuestionRepository();
const revisionRepository = new RevisionRepository();
const srsService = new SpacedRepetitionService();
const testHistoryRepository = new TestHistoryRepository();

export class RevisionController {
  async generateRevisionSet(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { count, patternIds, difficulties } = req.body;

      const questions = await questionRepository.findForRevision(userId, {
        limit: count || 5,
        patternIds,
        difficulties,
      });

      res.status(200).json({
        status: "success",
        data: { questions },
      });
    } catch (error) {
      next(error);
    }
  }

  async submitRevision(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { questionId } = req.params;
      const { rating } = req.body;

      const question = await questionRepository.findById(questionId);
      if (!question || question.userId.toString() !== userId) {
        throw new NotFoundError("Question not found");
      }

      // Calculate next scheduled values
      const srsUpdate = srsService.calculateNextRevision(
        rating,
        question.easeFactor,
        question.interval,
        question.revisionCount
      );

      // Save question statistics
      const updatedQuestion = await questionRepository.update(questionId, userId, {
        ...srsUpdate,
        lastRevisedAt: new Date(),
      });

      // Log this history detail
      await revisionRepository.createHistory({
        questionId: questionId as any,
        userId: userId as any,
        rating,
        nextInterval: srsUpdate.interval,
        revisedAt: new Date(),
      });

      res.status(200).json({
        status: "success",
        data: { question: updatedQuestion },
      });
    } catch (error) {
      next(error);
    }
  }

  async getHeatmap(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 365);

      const heatmap = await revisionRepository.getHeatmapData(userId, startDate, endDate);

      res.status(200).json({
        status: "success",
        data: { heatmap },
      });
    } catch (error) {
      next(error);
    }
  }

  async getDashboardStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      // 1. Solved counts
      const totalSolved = await questionRepository.countByUserId(userId);

      // 2. Scheduled reviews
      const now = new Date();
      const upcomingCount = await Question.countDocuments({
        userId,
        nextRevisionAt: { $lte: now },
      });

      // 3. Weakest patterns
      const rawWeak = await revisionRepository.getWeakPatterns(userId);
      const weakPatterns = rawWeak.slice(0, 3).map((w) => ({
        id: w._id,
        name: w.pattern.name,
        score: w.avgScore,
        totalRevisions: w.totalRevisions,
      }));

      // 4. Visual distribution maps
      const patternStats = await questionRepository.getStatsByPattern(userId);
      const distribution = patternStats.map((s) => ({
        id: s._id,
        name: s.pattern.name,
        count: s.count,
        easy: s.easyCount,
        medium: s.mediumCount,
        hard: s.hardCount,
      }));

      res.status(200).json({
        status: "success",
        data: {
          totalSolved,
          upcomingCount,
          weakPatterns,
          distribution,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async saveTestHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { patterns, questions, score, totalQuestions, timeTaken } = req.body;

      const testRecord = await testHistoryRepository.create({
        userId: userId as any,
        patterns,
        questions,
        score,
        totalQuestions,
        timeTaken,
      });

      res.status(201).json({
        status: "success",
        data: { testRecord },
      });
    } catch (error) {
      next(error);
    }
  }

  async getTestHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const history = await testHistoryRepository.findByUser(userId);

      res.status(200).json({
        status: "success",
        data: { history },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default RevisionController;
