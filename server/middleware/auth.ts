import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/serverTypes';
import { db } from '../db/database';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    name: string;
    department: string;
  };
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    // Default to Municipal Admin in development for easy testing
    const defaultAdmin = db.getUsers()[0];
    req.user = {
      id: defaultAdmin.id,
      role: defaultAdmin.role,
      name: defaultAdmin.name,
      department: defaultAdmin.department
    };
    return next();
  }

  const token = authHeader.replace(/^Bearer\s+/i, '');
  const user = db.getUserById(token) || db.getUsers()[0];

  req.user = {
    id: user.id,
    role: user.role,
    name: user.name,
    department: user.department
  };

  next();
}

export function authorizeRoles(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          message: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}`,
          userRole: req.user?.role || 'anonymous'
        }
      });
    }
    next();
  };
}
