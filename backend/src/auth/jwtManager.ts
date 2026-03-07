import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export interface UserPayload {
  userId: string;
  role: 'admin' | 'user';
}

export class JWTManager {
  private static readonly ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET!;
  private static readonly REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!;
  
  // Short-lived: 15 minutes
  private static readonly ACCESS_TOKEN_EXPIRY = '15m';
  // Long-lived: 7 days
  private static readonly REFRESH_TOKEN_EXPIRY = '7d';

  static generateAccessToken(payload: UserPayload): string {
    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, { expiresIn: this.ACCESS_TOKEN_EXPIRY });
  }

  static generateRefreshToken(payload: UserPayload): string {
    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, { expiresIn: this.REFRESH_TOKEN_EXPIRY });
  }

  static verifyAccessToken(token: string): UserPayload {
    try {
      return jwt.verify(token, this.ACCESS_TOKEN_SECRET) as UserPayload;
    } catch (error) {
      throw new Error('Invalid or expired access token.');
    }
  }

  static verifyRefreshToken(token: string): UserPayload {
    try {
      return jwt.verify(token, this.REFRESH_TOKEN_SECRET) as UserPayload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token.');
    }
  }
}
