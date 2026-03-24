import { Request, Response, NextFunction } from 'express';

/**
 * ApiError: A custom error class for our API.
 *
 * WHY extend Error?
 * So we can throw it like a normal Error but also carry HTTP status codes.
 * This means anywhere in our controllers we can do:
 *   throw new ApiError(404, 'Job not found');
 * And our error handler below will catch it and respond correctly.
 */
export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // vs programming errors (bugs)
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * errorHandler: Express global error handler middleware.
 *
 * WHY 4 parameters?
 * Express identifies error-handling middleware by having exactly 4 params:
 * (err, req, res, next). If you use (req, res, next) it won't catch errors!
 *
 * WHY centralize error handling?
 * Without this, each controller would need its own try/catch + res.status(500).
 * With this, controllers just throw errors and this middleware handles the rest.
 */
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // ─── Mongoose Specific Errors ───────────────────────────────────────────────

  // 1. Validation Error (e.g. required field missing, string too short)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    // Map all the specific field messages into a single string
    message = Object.values(err.errors).map((val: any) => val.message).join(', ');
  }

  // 2. Cast Error (e.g. invalid MongoDB ObjectId in URL)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field: ${err.path}`;
  }

  // 3. Duplicate Key Error (MongoDB error code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  // Log the full error in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ API Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Only expose stacktrace in development — never in production!
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
