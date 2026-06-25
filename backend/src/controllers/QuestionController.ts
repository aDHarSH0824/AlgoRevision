import { Response, NextFunction } from "express";
import { QuestionRepository } from "../repositories/QuestionRepository";
import { PatternRepository } from "../repositories/PatternRepository";
import { NotFoundError, BadRequestError } from "../utils/errors";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

const questionRepository = new QuestionRepository();
const patternRepository = new PatternRepository();

export class QuestionController {
  async getQuestions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { patternId, difficulty, search, limit, skip } = req.query;

      const { questions, total } = await questionRepository.findByUserId(userId, {
        patternId: patternId as string,
        difficulty: difficulty as string,
        search: search as string,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        skip: skip ? parseInt(skip as string, 10) : undefined,
      });

      res.status(200).json({
        status: "success",
        data: { questions, total },
      });
    } catch (error) {
      next(error);
    }
  }

  async createQuestion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { title, difficulty, platform, url, notes, patternId } = req.body;

      // Validate pattern ownership
      const pattern = await patternRepository.findById(patternId);
      if (!pattern || pattern.userId.toString() !== userId) {
        throw new BadRequestError("Invalid pattern ID or association");
      }

      const question = await questionRepository.create({
        title,
        difficulty,
        platform,
        url,
        notes,
        patternId: patternId as any,
        userId: userId as any,
        nextRevisionAt: new Date(), // Immediately queue for revision upon creation
      });

      res.status(201).json({
        status: "success",
        data: { question },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateQuestion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { title, difficulty, platform, url, notes, patternId } = req.body;

      // Validate pattern if it is being changed
      if (patternId) {
        const pattern = await patternRepository.findById(patternId);
        if (!pattern || pattern.userId.toString() !== userId) {
          throw new BadRequestError("Invalid pattern ID or association");
        }
      }

      const question = await questionRepository.update(id, userId, {
        title,
        difficulty,
        platform,
        url,
        notes,
        patternId: patternId ? (patternId as any) : undefined,
      });

      if (!question) {
        throw new NotFoundError("Question not found");
      }

      res.status(200).json({
        status: "success",
        data: { question },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteQuestion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const question = await questionRepository.delete(id, userId);
      if (!question) {
        throw new NotFoundError("Question not found");
      }

      res.status(200).json({
        status: "success",
        message: "Question deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default QuestionController;
