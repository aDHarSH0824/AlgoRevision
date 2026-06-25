import { Response, NextFunction } from "express";
import { PatternRepository } from "../repositories/PatternRepository";
import { QuestionRepository } from "../repositories/QuestionRepository";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

const patternRepository = new PatternRepository();
const questionRepository = new QuestionRepository();

export class PatternController {
  async getPatterns(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const patterns = await patternRepository.findByUserId(userId);
      const questionStats = await questionRepository.getStatsByPattern(userId);

      // Map question counts and difficulty splits to each pattern
      const result = patterns.map((pattern) => {
        const stats = questionStats.find((s) => s._id.toString() === pattern._id.toString());
        return {
          id: pattern._id,
          name: pattern.name,
          description: pattern.description,
          solvedCount: stats ? stats.count : 0,
          easyCount: stats ? stats.easyCount : 0,
          mediumCount: stats ? stats.mediumCount : 0,
          hardCount: stats ? stats.hardCount : 0,
          createdAt: pattern.createdAt,
        };
      });

      res.status(200).json({
        status: "success",
        data: { patterns: result },
      });
    } catch (error) {
      next(error);
    }
  }

  async createPattern(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { name, description } = req.body;

      const existing = await patternRepository.findByNameAndUserId(name, userId);
      if (existing) {
        throw new BadRequestError("Pattern with this name already exists");
      }

      const pattern = await patternRepository.create({
        name,
        description,
        userId: userId as any,
      });

      res.status(201).json({
        status: "success",
        data: { pattern },
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePattern(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { name, description } = req.body;

      const existing = await patternRepository.findByNameAndUserId(name, userId);
      if (existing && existing._id.toString() !== id) {
        throw new BadRequestError("Another pattern with this name already exists");
      }

      const pattern = await patternRepository.update(id, userId, { name, description });
      if (!pattern) {
        throw new NotFoundError("Pattern not found");
      }

      res.status(200).json({
        status: "success",
        data: { pattern },
      });
    } catch (error) {
      next(error);
    }
  }

  async deletePattern(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const pattern = await patternRepository.delete(id, userId);
      if (!pattern) {
        throw new NotFoundError("Pattern not found");
      }

      // Automatically clean up questions inside the deleted pattern
      await questionRepository.deleteManyByPatternId(id, userId);

      res.status(200).json({
        status: "success",
        message: "Pattern and its associated questions deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default PatternController;
