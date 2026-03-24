import { Router } from 'express';
import { check } from 'express-validator';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// ─── WHY express-validator? ───────────────────────────────────────────────────
// We validate data at the ROUTE routing layer before it even hits the controller.
// It stops bad requests early and provides clean array of error messages.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/auth/register
 * @desc    Register a user (jobseeker or employer)
 * @access  Public
 */
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('role', 'Role must be either jobseeker or employer')
      .optional()
      .isIn(['jobseeker', 'employer']),
  ],
  asyncHandler(authController.register)
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  asyncHandler(authController.login)
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private (requires token)
 */
// Notice how we stack middleware here: `authenticate` comes first!
router.get('/me', authenticate, asyncHandler(authController.getMe));

export default router;
