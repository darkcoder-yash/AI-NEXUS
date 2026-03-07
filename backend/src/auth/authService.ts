import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config.js';
import { JWTManager, UserPayload } from './jwtManager.js';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'user';
  is_verified: boolean;
  verification_token?: string;
  reset_token?: string;
  reset_expiry?: number;
}

export interface Session {
  id: string;
  user_id: string;
  refresh_token: string;
  expires_at: number;
}

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

export class AuthService {
  private static readonly BCRYPT_SALT_ROUNDS = 12;

  /**
   * Registers a new user with hashed password and verification token.
   */
  static async register(email: string, password: string): Promise<User> {
    const password_hash = await bcrypt.hash(password, this.BCRYPT_SALT_ROUNDS);
    const verification_token = uuidv4();

    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash,
        role: 'user',
        is_verified: false,
        verification_token
      })
      .select()
      .single();

    if (error) throw new Error(`Registration failed: ${error.message}`);
    return data;
  }

  /**
   * Authenticates user and creates a secure session.
   */
  static async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) throw new Error('Invalid email or password.');
    if (!user.is_verified) throw new Error('Email not verified. Please check your inbox.');

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new Error('Invalid email or password.');

    const payload: UserPayload = { userId: user.id, role: user.role };
    const accessToken = JWTManager.generateAccessToken(payload);
    const refreshToken = JWTManager.generateRefreshToken(payload);

    // Save refresh token in sessions table
    await supabase.from('sessions').insert({
      user_id: user.id,
      refresh_token: refreshToken,
      expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return { accessToken, refreshToken };
  }

  /**
   * Rotates refresh tokens and issues new access token.
   */
  static async refresh(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = JWTManager.verifyRefreshToken(token);
    
    // Check if session exists in DB
    const { data: session, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('refresh_token', token)
      .single();

    if (error || !session) throw new Error('Session invalid or revoked.');

    // Remove old session and create new one (Refresh Token Rotation)
    await supabase.from('sessions').delete().eq('refresh_token', token);

    const newAccessToken = JWTManager.generateAccessToken({ userId: payload.userId, role: payload.role });
    const newRefreshToken = JWTManager.generateRefreshToken({ userId: payload.userId, role: payload.role });

    await supabase.from('sessions').insert({
      user_id: payload.userId,
      refresh_token: newRefreshToken,
      expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  /**
   * Invalidates session on logout.
   */
  static async logout(refreshToken: string) {
    await supabase.from('sessions').delete().eq('refresh_token', refreshToken);
  }
}
