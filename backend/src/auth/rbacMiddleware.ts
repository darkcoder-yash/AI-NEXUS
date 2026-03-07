import { Request, Response, NextFunction } from 'express';
import { JWTManager, UserPayload } from './jwtManager.js';

/**
 * Extend Express Request to include user data.
 */
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

/**
 * Ensures user is authenticated via Bearer token.
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = JWTManager.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

/**
 * Guards routes based on user roles.
 */
export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
}

/**
 * Guards tool execution based on tool-level permissions.
 */
export class PermissionGuard {
  static async verify(userId: string, userRole: string, requiredPermission: string) {
    // If the required permission is 'admin_only' and user is not admin
    if (requiredPermission === 'admin_only' && userRole !== 'admin') {
      throw new Error(`Permission Denied: ${requiredPermission} required.`);
    }

    // You can extend this with a database-backed permission mapping
    // e.g., const userPerms = await PermissionService.getUserPermissions(userId);
    // if (!userPerms.includes(requiredPermission)) throw Error(...)
    
    return true;
  }
}
