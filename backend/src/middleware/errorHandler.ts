import { Request, Response, NextFunction } from 'express';
import { StructuredLogger } from '../services/logger.js';
import { config } from '../config.js';

/**
 * Global Error Handler for Express and Async middleware.
 */
export function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user?.userId;
  const requestId = req.headers['x-request-id'] as string || 'unknown';

  const statusCode = err.status || 500;
  const severity = statusCode >= 500 ? 'critical' : 'high';

  // Log structured error
  StructuredLogger.error(`API Error: ${err.message}`, userId, requestId, {
    status: statusCode,
    severity,
    path: req.path,
    method: req.method,
    stack: config.NODE_ENV === 'development' ? err.stack : undefined,
    metadata: err.metadata || {}
  });

  // Client response
  res.status(statusCode).json({
    error: {
      message: statusCode >= 500 ? 'An internal server error occurred.' : err.message,
      code: err.code || 'INTERNAL_ERROR',
      requestId
    }
  });
}

/**
 * Async wrapper for Express routes to catch errors and pass them to globalErrorHandler.
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
