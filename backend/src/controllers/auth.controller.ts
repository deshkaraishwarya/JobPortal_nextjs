import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User';
import { ApiError } from '../middleware/errorHandler';

// ─── JWT Generation Helper ────────────────────────────────────────────────────
//
// WHY a separate function?
// We generate tokens in both Register and Login. Dry it out!
// The token payload contains just the userId because the token is NOT
// encrypted (it's bas64 encoded), so anyone can decode it.
// NEVER put passwords or social security numbers in a JWT!
//
const generateToken = (userId: string, role: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  return jwt.sign({ userId, role }, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
  });
};

// ─── Register User ────────────────────────────────────────────────────────────
//
// POST /api/auth/register
// Public endpoint for both Jobseekers and Employers to sign up.
//
export const register = async (req: Request, res: Response): Promise<void> => {
  // 1. Check for validation errors from express-validator (we define these in the routes file)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return early with 400 Bad Request and the list of form errors
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const { name, email, password, role } = req.body;

  // 2. Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'User with this email already exists');
  }

  // 3. Create the user
  // (Password hashing happens AUTOMATICALLY inside models/User.ts pre-save hook!)
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'jobseeker',
  });

  // 4. Generate JWT
  const token = generateToken(user._id.toString(), user.role);

  // 5. Send response
  // Notice we don't send the password back! Our toJSON transform in models/User.ts
  // handles stripping the password field securely.
  res.status(201).json({
    success: true,
    token,
    user,
  });
};

// ─── Login User ───────────────────────────────────────────────────────────────
//
// POST /api/auth/login
// Public endpoint to exchange email/password for a JWT
//
export const login = async (req: Request, res: Response): Promise<void> => {
  // 1. Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const { email, password } = req.body;

  // 2. Find user. We MUST use .select('+password') here because we set 
  // select: false on the model to prevent accidental leakage in other queries.
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    // Security tip: Use a generic error. Don't tell them "Email not found".
    // "Invalid credentials" makes it harder for malicious users to guess emails.
    throw new ApiError(401, 'Invalid email or password');
  }

  // 3. Check if password matches
  // Our model instance method comparePassword safely uses bcrypt.compare()
  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // 4. Generate JWT
  const token = generateToken(user._id.toString(), user.role);

  // 5. Remove password from the user object before sending it to the client
  // Mongoose documents aren't plain objects. We convert toJSON() to apply
  // the transform we defined in models/User.ts which deletes the password.
  res.status(200).json({
    success: true,
    token,
    user: user.toJSON(),
  });
};

// ─── Get Current User (Me) ────────────────────────────────────────────────────
//
// GET /api/auth/me
// Protected endpoint using our `authenticate` middleware.
// Used by the frontend on initial page load to "re-hydrate" the user session.
//
export const getMe = async (req: Request, res: Response): Promise<void> => {
  // `req.user` is populated by the `authenticate` middleware after verifying the JWT.
  const user = await User.findById(req.user?.userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json({
    success: true,
    user,
  });
};
