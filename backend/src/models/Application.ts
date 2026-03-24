import mongoose, { Document, Schema } from 'mongoose';

/**
 * ─── Application Interfaces ───────────────────────────────────────────────────
 */
export interface IApplication {
  job: mongoose.Types.ObjectId;      // The job being applied to
  applicant: mongoose.Types.ObjectId; // The user applying
  employer: mongoose.Types.ObjectId;  // The user who posted the job (Denormalized for fast queries!)
  resume: string;                     // URL to uploaded resume (e.g. AWS S3 link)
  coverLetter?: string;
  status: 'pending' | 'reviewed' | 'interviewing' | 'rejected' | 'hired';
}

export interface IApplicationDocument extends IApplication, Document {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ─── Application Schema ───────────────────────────────────────────────────────
 */
const applicationSchema = new Schema<IApplicationDocument>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    applicant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // WHY DENORMALIZE THIS?
    // By duplicating `employer` here, we make the Employer Dashboard incredibly fast.
    // An employer can do `Application.find({ employer: req.user.userId })` globally
    // without having to aggregate and join across the Job table!
    employer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resume: {
      type: String,
      required: [true, 'Please provide a resume link'],
    },
    coverLetter: {
      type: String,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'interviewing', 'rejected', 'hired'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

/**
 * ─── Indexes ──────────────────────────────────────────────────────────────────
 */
// 1. Compound Unique Index: Prevent a user from applying to the same job twice!
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

// 2. Index for Job Seekers viewing their own applications
applicationSchema.index({ applicant: 1, createdAt: -1 });

// 3. Index for Employers viewing applications for their jobs
applicationSchema.index({ employer: 1, status: 1 });

export default mongoose.model<IApplicationDocument>('Application', applicationSchema);
