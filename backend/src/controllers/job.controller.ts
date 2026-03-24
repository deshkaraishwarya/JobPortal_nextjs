import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Job, { IJobDocument } from '../models/Job';
import { ApiError } from '../middleware/errorHandler';

// ─── Create a Job ─────────────────────────────────────────────────────────────
// POST /api/jobs
// Protected: Only 'employer' roles can create jobs (we'll enforce this in middleware)
export const createJob = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  // Ensure user is an employer
  if (req.user?.role !== 'employer') {
    throw new ApiError(403, 'Only employers can post jobs');
  }

  // Inject the user ID from the JWT token into the job data
  const jobData = {
    ...req.body,
    postedBy: req.user.userId,
  };

  const job = await Job.create(jobData);

  res.status(201).json({
    success: true,
    job,
  });
};

// ─── Get All Jobs (with Filtering, Pagination, Search) ────────────────────────
// GET /api/jobs
// Public endpoint
export const getJobs = async (req: Request, res: Response): Promise<void> => {
  // 1. Pagination prep
  // Base 10 is the radis for parseInt. Default to page 1, 10 items per page.
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const skip = (page - 1) * limit;

  // 2. Build the query object dynamically
  // We use Record<string, any> so we can add keys conditionally
  const query: Record<string, any> = { status: 'open' }; // generally only show open jobs

  // Full-text search (matches against title, location, and skills defined in Phase 2 indexes)
  if (req.query.search) {
    query.$text = { $search: req.query.search as string };
  }

  // Exact match filters
  if (req.query.jobType) query.jobType = req.query.jobType;
  if (req.query.experienceLevel) query.experienceLevel = req.query.experienceLevel;
  if (req.query.location) query.location = { $regex: req.query.location, $options: 'i' }; // Case-insensitive partial match
  if (req.query.isRemote) query.isRemote = req.query.isRemote === 'true';

  // 3. Execute query with pagination
  // WHY two queries?
  // We need `total` to tell the frontend how many pages there are in total.
  // We use Promise.all to run them concurrently (much faster than waiting for one, then the other).
  const [jobs, total] = await Promise.all([
    Job.find(query)
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(limit)
      .populate('postedBy', 'name company avatar'), // only grab specific fields from User to save bandwidth
    Job.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: jobs.length,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
    jobs,
  });
};

// ─── Get Single Job ───────────────────────────────────────────────────────────
// GET /api/jobs/:id
// Public endpoint
export const getJobById = async (req: Request, res: Response): Promise<void> => {
  const job = await Job.findById(req.params.id)
    .populate('postedBy', 'name company avatar email');

  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  res.status(200).json({
    success: true,
    job,
  });
};

// ─── Update Job ───────────────────────────────────────────────────────────────
// PUT /api/jobs/:id
// Protected: Only the employer who created it can update it
export const updateJob = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  let job = await Job.findById(req.params.id);

  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  // Authorization check: Make sure the logged-in user actually owns this job!
  // Note: job.postedBy is an ObjectId, so we compare `.toString()` with the JWT string.
  if (job.postedBy.toString() !== req.user?.userId) {
    throw new ApiError(403, 'User not authorized to update this job');
  }

  // findByIdAndUpdate is more efficient, but we already have the doc so we can just update it
  job = await Job.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true } // Return updated doc, AND run schema validations!
  );

  res.status(200).json({
    success: true,
    job,
  });
};

// ─── Delete Job ───────────────────────────────────────────────────────────────
// DELETE /api/jobs/:id
// Protected: Only the employer who created it can delete it
export const deleteJob = async (req: Request, res: Response): Promise<void> => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  // Authorization check
  if (job.postedBy.toString() !== req.user?.userId) {
    throw new ApiError(403, 'User not authorized to delete this job');
  }

  await job.deleteOne(); // removes from MongoDB

  res.status(200).json({
    success: true,
    message: 'Job deleted successfully',
  });
};
