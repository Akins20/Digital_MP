/**
 * Authentication Middleware
 * Protects routes and verifies JWT tokens
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader, TokenPayload } from '../utils/jwt';
import { UserRole } from '../models/User';

// Extend Express Request to include user
export interface AuthRequest extends Request {
  user?: TokenPayload;
}

/**
 * Middleware to authenticate requests (required)
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const user = verifyToken(token);

    if (!user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

/**
 * Middleware to optionally authenticate requests
 * Sets req.user if a valid token is provided, but doesn't fail if no token
 */
export const optionalAuthenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    // If no token, just continue without setting req.user
    if (!token) {
      next();
      return;
    }

    const user = verifyToken(token);

    // If valid token, set req.user
    if (user) {
      req.user = user;
    }

    // Always continue, even if token is invalid
    next();
  } catch (error) {
    // Even if there's an error, continue without authentication
    next();
  }
};

/**
 * Middleware to require admin role
 */
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role !== UserRole.ADMIN) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
};

/**
 * Middleware to require seller role
 */
export const requireSeller = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role !== UserRole.SELLER && req.user.role !== UserRole.ADMIN) {
    res.status(403).json({ error: 'Seller access required' });
    return;
  }

  next();
};
