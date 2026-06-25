import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IUser } from "../models/User";

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateToken(user: IUser): string {
    const secret = process.env.JWT_SECRET || "fallback_jwt_secret_token_12345";
    const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
    return jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      secret,
      { expiresIn: expiresIn as any }
    );
  }

  verifyToken(token: string): any {
    const secret = process.env.JWT_SECRET || "fallback_jwt_secret_token_12345";
    return jwt.verify(token, secret);
  }
}

export default AuthService;
