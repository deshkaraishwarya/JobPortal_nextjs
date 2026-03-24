import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from './errorHandler';

/**
 * JwtPayload: The shape of data we store inside the JWT token.
 * We only store the userId — never put passwords or sensitive data in JWT!
 * The token is base64-encoded, not encrypted, so anyone can decode it.
 */
interface JwtPayload {
  userId: string;
  role: string;
  iat?: number; // issued at (auto-added by jsonwebtoken)
  exp?: number; // expiry (auto-added by jsonwebtoken)
}

/**
 * Extend Express's Request type to include our `user` property.
 * WHY? By default req.user doesn't exist on Express's Request type.
 * This TypeScript declaration merging lets us safely use req.user
 * in any authenticated route handler.
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * authenticate: Middleware that protects routes requiring login.
 *
 * Flow:
 * 1. Extract token from "Authorization: Bearer <token>" header
 * 2. Verify the token is valid and not expired using our JWT_SECRET
 * 3. Attach the decoded payload (userId) to req.user
 * 4. Call next() to proceed to the route handler
 *
 * If anything fails → throw ApiError(401) → errorHandler sends JSON error
 */
export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'No token provided. Please log in.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired token. Please log in again.');
  }
};
