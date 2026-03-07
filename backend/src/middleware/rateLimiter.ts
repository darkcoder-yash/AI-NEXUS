import rateLimit from 'express-rate-limit';
import { config } from '../config.js';
import { StructuredLogger } from '../services/logger.js';

/**
 * Global API rate limiter based on IP.
 */
export const globalRateLimiter = rateLimit({
  windowMs: config.WINDOW_SIZE_MS,
  max: config.MAX_REQUESTS_PER_WINDOW,
  message: {
    status: 429,
    error: 'Too many requests. Please try again later.',
  },
  handler: (req, res, next, options) => {
    StructuredLogger.warn(`Rate limit exceeded for IP: ${req.ip}`, undefined, req.headers['x-request-id'] as string);
    res.status(options.statusCode).send(options.message);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Higher limit for Auth endpoints to prevent brute force.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 5, // 5 attempts per window
  message: {
    status: 429,
    error: 'Brute-force protection: Too many login attempts. Account temporarily locked for 15 minutes.',
  },
  skipSuccessfulRequests: true,
});

/**
 * Tool-specific rate limiting logic.
 */
export class ToolRateLimiter {
  private static toolLimits = new Map<string, { count: number, lastReset: number }>();

  static check(toolName: string, userId: string, limit: number, windowMs: number = 60000) {
    const key = `${userId}:${toolName}`;
    const now = Date.now();
    const state = this.toolLimits.get(key) || { count: 0, lastReset: now };

    if (now - state.lastReset > windowMs) {
      state.count = 1;
      state.lastReset = now;
    } else if (state.count >= limit) {
      throw new Error(`Tool rate limit exceeded: ${toolName}. Limit: ${limit} per min.`);
    } else {
      state.count++;
    }

    this.toolLimits.set(key, state);
  }
}
