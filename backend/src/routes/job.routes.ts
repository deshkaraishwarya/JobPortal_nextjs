import { Router } from 'express';
import { check } from 'express-validator';
import * as jobController from '../controllers/job.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

// ─── Custom Middleware: Require Employer ──────────────────────────────────────
// Used alongside `authenticate` to ensure the token belongs to an Employer.
const requireEmployer = (req: Request, _res: Response, next: NextFunction) => {
  if (req.user?.role !== 'employer') {
    next(new ApiError(403, 'Access denied. Must be an employer.'));
  } else {
    next();
  }
};

// ─── Validation Arrays ────────────────────────────────────────────────────────
// We extract these so we can use them cleanly in both POST & PUT routes
const jobValidation = [
  check('title', 'Title is required').not().isEmpty(),
  check('company', 'Company is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty(),
  check('location', 'Location is required').not().isEmpty(),
  check('jobType', 'Valid job type is required').isIn([
    'full-time', 'part-time', 'contract', 'internship', 'freelance'
  ]),
  check('experienceLevel', 'Valid experience level is required').isIn([
    'entry', 'mid', 'senior', 'lead', 'executive'
  ]),
  check('salary.min', 'Minimum salary is required').isNumeric(),
  check('salary.max', 'Maximum salary is required').isNumeric(),
];

// ─── Public Routes ────────────────────────────────────────────────────────────
// Anyone can view jobs
router.get('/', asyncHandler(jobController.getJobs));
router.get('/:id', asyncHandler(jobController.getJobById));

// ─── Protected Employer Routes ────────────────────────────────────────────────
// Note: We stack `authenticate` AND `requireEmployer` sequentially.
// If `authenticate` fails, it halts request. If it passes, `requireEmployer` runs.

router.post(
  '/',
  authenticate,
  requireEmployer,
  jobValidation,
  asyncHandler(jobController.createJob)
);

router.put(
  '/:id',
  authenticate,
  requireEmployer,
  jobValidation, // On PUT, we re-run the same strict validations
  asyncHandler(jobController.updateJob)
);

router.delete(
  '/:id',
  authenticate,
  requireEmployer,
  asyncHandler(jobController.deleteJob)
);

export default router;
