import { Router } from 'express';
import { check } from 'express-validator';
import * as applicationController from '../controllers/application.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

// Middleware to restrict to Jobseekers
const requireJobseeker = (req: Request, _res: Response, next: NextFunction) => {
  if (req.user?.role !== 'jobseeker') {
    next(new ApiError(403, 'Access denied. Must be a job seeker to apply.'));
  } else {
    next();
  }
};

// Middleware to restrict to Employers
const requireEmployer = (req: Request, _res: Response, next: NextFunction) => {
  if (req.user?.role !== 'employer') {
    next(new ApiError(403, 'Access denied. Must be an employer.'));
  } else {
    next();
  }
};

// All routes require authentication
router.use(authenticate);

// ─── Jobseeker Routes ────────────────────────────────────────────────────────
router.post(
  '/:jobId',
  requireJobseeker,
  [
    check('resume', 'Resume link is required').not().isEmpty(),
  ],
  asyncHandler(applicationController.applyToJob)
);

router.get('/me', requireJobseeker, asyncHandler(applicationController.getMyApplications));

// ─── Employer Routes ─────────────────────────────────────────────────────────
router.get('/employer', requireEmployer, asyncHandler(applicationController.getEmployerApplications));

router.put(
  '/:id/status',
  requireEmployer,
  [
    check('status', 'Status is required').not().isEmpty(),
  ],
  asyncHandler(applicationController.updateApplicationStatus)
);

export default router;
