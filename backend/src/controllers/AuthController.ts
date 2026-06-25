import { Request, Response, NextFunction } from "express";
import { OAuth2Client } from "google-auth-library";
import { UserRepository } from "../repositories/UserRepository";
import { AuthService } from "../services/AuthService";
import { BadRequestError, UnauthorizedError } from "../utils/errors";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

const userRepository = new UserRepository();
const authService = new AuthService();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password } = req.body;
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        throw new BadRequestError("Email is already registered");
      }

      const hashedPassword = await authService.hashPassword(password);
      const user = await userRepository.create({
        name,
        email,
        password: hashedPassword,
      });

      const token = authService.generateToken(user);
      res.status(201).json({
        status: "success",
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const user = await userRepository.findByEmail(email);
      if (!user || !user.password) {
        throw new UnauthorizedError("Invalid credentials");
      }

      const isMatch = await authService.comparePassword(password, user.password);
      if (!isMatch) {
        throw new UnauthorizedError("Invalid credentials");
      }

      const token = authService.generateToken(user);
      res.status(200).json({
        status: "success",
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async googleLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;
      if (!token) {
        throw new BadRequestError("Google token is required");
      }

      let email: string;
      let name: string;
      let avatar: string | undefined;
      let googleId: string;

      // Check if we should use mock logic for local development if client ID is missing
      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (!clientId || token === "mock_google_token") {
        // Mock verification for debugging/testing
        email = "testgoogle@gmail.com";
        name = "Google Tester";
        googleId = "google-123456789";
      } else {
        const ticket = await googleClient.verifyIdToken({
          idToken: token,
          audience: clientId,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
          throw new BadRequestError("Invalid Google token payload");
        }

        email = payload.email;
        name = payload.name || email.split("@")[0];
        avatar = payload.picture;
        googleId = payload.sub;
      }

      let user = await userRepository.findByEmail(email);

      if (!user) {
        user = await userRepository.create({
          name,
          email,
          avatar,
          googleId,
        });
      } else if (!user.googleId) {
        user.googleId = googleId;
        if (avatar) user.avatar = avatar;
        await user.save();
      }

      const jwtToken = authService.generateToken(user);
      res.status(200).json({
        status: "success",
        data: {
          token: jwtToken,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError("User session context missing");
      }
      const user = await userRepository.findById(req.user.id);
      if (!user) {
        throw new UnauthorizedError("User profile not found");
      }

      res.status(200).json({
        status: "success",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
