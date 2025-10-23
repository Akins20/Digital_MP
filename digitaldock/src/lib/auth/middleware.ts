/**
 * Auth Middleware
 * Protects API routes and verifies user authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, TokenPayload } from './jwt';
import { UserRole } from '@/models/User';

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload;
}

/**
 * Middleware to verify JWT token
 */
export async function authenticateUser(
  request: NextRequest
): Promise<{ user: TokenPayload | null; error: NextResponse | null }> {
  const authHeader = request.headers.get('Authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return {
      user: null,
      error: NextResponse.json({ error: 'No token provided' }, { status: 401 }),
    };
  }

  const user = verifyToken(token);

  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }),
    };
  }

  return { user, error: null };
}

/**
 * Middleware to check if user is an admin
 */
export function requireAdmin(user: TokenPayload): NextResponse | null {
  if (user.role !== UserRole.ADMIN) {
    return NextResponse.json(
      { error: 'Unauthorized. Admin access required' },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Middleware to check if user is a seller
 */
export function requireSeller(user: TokenPayload): NextResponse | null {
  if (user.role !== UserRole.SELLER && user.role !== UserRole.ADMIN) {
    return NextResponse.json(
      { error: 'Unauthorized. Seller access required' },
      { status: 403 }
    );
  }
  return null;
}
