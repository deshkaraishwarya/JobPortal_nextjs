import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Application from '../models/Application';
import Job from '../models/Job';
import mongoose from 'mongoose';
import { ApiError } from '../middleware/errorHandler';

// ─── Apply to a Job ───────────────────────────────────────────────────────────
// POST /api/applications/:jobId
// Protected: Only 'jobseeker' roles can apply
export const applyToJob = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const { jobId } = req.params;
  const { resume, coverLetter } = req.body;

  // 1. Verify Job exists
  const job = await Job.findById(jobId);
  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  // 2. Prevent Employer applying to their own job 
  if (job.postedBy.toString() === req.user?.userId) {
    throw new ApiError(400, 'You cannot apply to your own job listing');
  }

  // 3. Check if user already applied
  // (We also have a MongoDB Unique Compound Index for this, but doing it here
  // allows us to throw a clean 400 error rather than crashing on a Mongo duplicate key error)
  const existingApplication = await Application.findOne({
    job: new mongoose.Types.ObjectId(jobId as string),
    applicant: new mongoose.Types.ObjectId(req.user!.userId as string),
  });

  if (existingApplication) {
    throw new ApiError(400, 'You have already applied to this job');
  }

  // 4. Create the application
  // Notice we save `job.postedBy` as the `employer` directly on the application!
  const application = await Application.create({
    job: new mongoose.Types.ObjectId(jobId as string),
    applicant: new mongoose.Types.ObjectId(req.user!.userId as string),
    employer: job.postedBy,
    resume,
    coverLetter,
  });

  // 5. Update the denormalized counter on the Job model
  // This takes ~5ms, but saves us hundreds of milliseconds on the Read query!
  job.applicationCount += 1;
  await job.save();

  res.status(201).json({
    success: true,
    message: 'Application submitted successfully',
    application,
  });
};

// ─── Get User's Applications (Jobseeker View) ─────────────────────────────────
// GET /api/applications/me
export const getMyApplications = async (req: Request, res: Response): Promise<void> => {
  const applications = await Application.find({ applicant: req.user?.userId })
    .sort({ createdAt: -1 })
    .populate('job', 'title company location status salary') // Get crucial job details
    .populate('employer', 'name email');

  res.status(200).json({
    success: true,
    count: applications.length,
    applications,
  });
};

// ─── Get Applications for an Employer's Jobs ──────────────────────────────────
// GET /api/applications/employer
// Protected: Only 'employer' roles
export const getEmployerApplications = async (req: Request, res: Response): Promise<void> => {
  // Because we denormalized `employer` onto the Application schema,
  // we can do a blazingly fast global query instead of populating all jobs and filtering!
  const applications = await Application.find({ employer: req.user?.userId })
    .sort({ createdAt: -1 })
    .populate('job', 'title')
    .populate('applicant', 'name email');

  res.status(200).json({
    success: true,
    count: applications.length,
    applications,
  });
};

// ─── Update Application Status ────────────────────────────────────────────────
// PUT /api/applications/:id/status
// Protected: Only 'employer' roles who own the job
export const updateApplicationStatus = async (req: Request, res: Response): Promise<void> => {
  const { status } = req.body;
  
  if (!['reviewed', 'interviewing', 'rejected', 'hired'].includes(status)) {
    throw new ApiError(400, 'Invalid status');
  }

  const application = await Application.findById(req.params.id);

  if (!application) {
    throw new ApiError(404, 'Application not found');
  }

  // Ensure ONLY the employer who posted the job can change its status
  if (application.employer.toString() !== req.user?.userId) {
    throw new ApiError(403, 'Not authorized to update this application');
  }

  application.status = status;
  await application.save();

  res.status(200).json({
    success: true,
    application,
  });
};
