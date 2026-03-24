/**
 * asyncHandler: Wraps async route handlers to catch unhandled promise rejections.
 *
 * WHY do we need this?
 * Express 4 does NOT automatically catch errors thrown in async functions.
 * Without this wrapper, an unhandled rejection crashes the process.
 *
 * WITHOUT asyncHandler — you'd write:
 *   app.get('/jobs', async (req, res, next) => {
 *     try {
 *       const jobs = await Job.find();
 *       res.json(jobs);
 *     } catch (err) {
 *       next(err); // ← you'd need this in EVERY handler
 *     }
 *   });
 *
 * WITH asyncHandler — clean and DRY:
 *   app.get('/jobs', asyncHandler(async (req, res) => {
 *     const jobs = await Job.find();
 *     res.json(jobs); // any thrown error is auto-forwarded to errorHandler
 *   }));
 *
 * Note: Express 5 (beta) handles this natively, but Express 4 needs this.
 */
import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;

export const asyncHandler =
  (fn: AsyncRequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
