import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];
  const user = await authService.validateToken(token);

  if (!user) {
    return res.status(401).json({ error: 'Session expired or invalid' });
  }

  // Attach enriched user object to request
  (req as any).user = user;
  next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (user?.role !== 'admin') {
    return res.status(403).json({ error: 'Administrative access required' });
  }

  next();
};

export const requireMFA = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (user?.mfa_enabled && !(req as any).mfa_verified) {
    return res.status(403).json({ error: 'MFA verification required' });
  }

  next();
};
