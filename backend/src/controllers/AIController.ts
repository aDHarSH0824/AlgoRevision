import { Response, NextFunction } from "express";
import { AIService } from "../services/AIService";
import { PatternRepository } from "../repositories/PatternRepository";
import { QuestionRepository } from "../repositories/QuestionRepository";
import { RevisionRepository } from "../repositories/RevisionRepository";
import { RevisionScheduleRepository } from "../repositories/RevisionScheduleRepository";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { Question } from "../models/Question";

const aiService = new AIService();
const patternRepository = new PatternRepository();
const questionRepository = new QuestionRepository();
const revisionRepository = new RevisionRepository();
const revisionScheduleRepository = new RevisionScheduleRepository();

export class AIController {
  async predictPattern(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, notes } = req.body;
      const predicted = await aiService.predictPattern(title, notes || "");

      res.status(200).json({
        status: "success",
        data: { pattern: predicted },
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecommendations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      // Extract patterns and filter to those solved
      const patterns = await patternRepository.findByUserId(userId);
      const questionStats = await questionRepository.getStatsByPattern(userId);
      const studiedPatterns = patterns
        .map((p) => {
          const stats = questionStats.find((s) => s._id.toString() === p._id.toString());
          return { name: p.name, solvedCount: stats ? stats.count : 0 };
        })
        .filter((p) => p.solvedCount > 0);

      const solvedList = await Question.find({ userId }).select("title");
      const solvedTitles = solvedList.map((q) => q.title);

      const recommendations = await aiService.recommendQuestions(studiedPatterns, solvedTitles);

      res.status(200).json({
        status: "success",
        data: { recommendations },
      });
    } catch (error) {
      next(error);
    }
  }

  async generateWeeklyPlan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      const rawWeak = await revisionRepository.getWeakPatterns(userId);
      const weakPatterns = rawWeak.map((w) => ({
        name: w.pattern.name,
        score: w.avgScore,
      }));

      const now = new Date();
      const upcomingCount = await Question.countDocuments({
        userId,
        nextRevisionAt: { $lte: now },
      });

      const plan = await aiService.generateWeeklyPlan(weakPatterns, upcomingCount);
      await revisionScheduleRepository.upsertWeeklyPlan(userId, plan);

      res.status(200).json({
        status: "success",
        data: { plan },
      });
    } catch (error) {
      next(error);
    }
  }

  async getWeeklyPlan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const schedule = await revisionScheduleRepository.findByUserId(userId);

      res.status(200).json({
        status: "success",
        data: { plan: schedule ? schedule.weeklyPlan : "" },
      });
    } catch (error) {
      next(error);
    }
  }

  async coachChat(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { message, context } = req.body;

      const solvedCount = await questionRepository.countByUserId(userId);
      const rawWeak = await revisionRepository.getWeakPatterns(userId);
      const weakList = rawWeak
        .slice(0, 3)
        .map((w) => w.pattern.name)
        .join(", ");

      const defaultContext = `The student has solved ${solvedCount} questions. Their weak patterns: ${
        weakList || "None logged yet"
      }.`;
      const combinedContext = context ? `${defaultContext}\nContext details: ${context}` : defaultContext;

      const reply = await aiService.chatWithCoach(message, combinedContext);

      res.status(200).json({
        status: "success",
        data: { reply },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AIController;
