import mongoose, { Document, Schema, Model, Types } from 'mongoose';

// ─── Job Type Enums ───────────────────────────────────────────────────────────
// Using string literal union types gives us autocomplete + compile-time safety.
// The same values are used in the Mongoose schema enum validation below.
// ─────────────────────────────────────────────────────────────────────────────

export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
export type JobStatus = 'open' | 'closed' | 'draft';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ISalaryRange {
  min: number;
  max: number;
  currency: string;
}

export interface IJob {
  title: string;
  company: string;
  companyLogo?: string;
  description: string;
  requirements: string[];      // e.g. ["3+ years React", "TypeScript experience"]
  responsibilities: string[];
  location: string;
  isRemote: boolean;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  salary: ISalaryRange;
  skills: string[];            // e.g. ["React", "Node.js", "MongoDB"]
  status: JobStatus;
  postedBy: Types.ObjectId;    // reference to the User (employer) who created it
  applicationCount: number;    // denormalized counter for fast reads
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IJobDocument extends IJob, Document {}

// ─── Schema ───────────────────────────────────────────────────────────────────
//
// WHY denormalize applicationCount here?
// Instead of counting applications with Application.countDocuments({ jobId }),
// we keep a counter on the Job document. This trades a tiny write overhead
// (increment on each application) for MUCH faster reads on the job listing page
// where we show "42 applicants". This is a common MongoDB pattern.
// ─────────────────────────────────────────────────────────────────────────────

const salarySchema = new Schema<ISalaryRange>(
  {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    currency: { type: String, default: 'USD', uppercase: true },
  },
  { _id: false } // Don't create an _id for this embedded sub-document
);

const jobSchema = new Schema<IJobDocument>(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },

    companyLogo: {
      type: String,
      default: '',
    },

    description: {
      type: String,
      required: [true, 'Job description is required'],
      minlength: [50, 'Description must be at least 50 characters'],
    },

    requirements: {
      type: [String],
      default: [],
    },

    responsibilities: {
      type: [String],
      default: [],
    },

    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      // e.g., "New York, NY" or "Remote" or "London, UK"
    },

    isRemote: {
      type: Boolean,
      default: false,
    },

    jobType: {
      type: String,
      enum: {
        values: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
        message: '{VALUE} is not a valid job type',
      },
      required: [true, 'Job type is required'],
    },

    experienceLevel: {
      type: String,
      enum: {
        values: ['entry', 'mid', 'senior', 'lead', 'executive'],
        message: '{VALUE} is not a valid experience level',
      },
      required: [true, 'Experience level is required'],
    },

    salary: {
      type: salarySchema,
      required: [true, 'Salary range is required'],
    },

    skills: {
      type: [String],
      default: [],
      // These will be indexed for search in Phase 6
    },

    status: {
      type: String,
      enum: ['open', 'closed', 'draft'],
      default: 'open',
    },

    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',              // ← Mongoose population reference
      required: true,
      //
      // WHY ref: 'User'?
      // This tells Mongoose the foreign key relationship.
      // You can then do: Job.findById(id).populate('postedBy')
      // which replaces the ObjectId with the full User document.
      // Similar concept to a SQL JOIN, but done at the application layer.
      //
    },

    applicationCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ─── Indexes for Search & Filtering ──────────────────────────────────────────
//
// Phase 6 will add full search with these indexes. We define them now
// so MongoDB creates the indexes when the app first connects — adding them
// later on a large dataset would require a slow background migration.
//
// Compound index: optimizes queries that filter by BOTH status AND createdAt
// e.g., "show open jobs, newest first" — a very common query on a job board.
//
jobSchema.index({ status: 1, createdAt: -1 });   // listing page (most common)
jobSchema.index({ postedBy: 1 });                 // "my posted jobs" (employer dashboard)
jobSchema.index({ jobType: 1 });                  // filter by type
jobSchema.index({ experienceLevel: 1 });          // filter by experience
jobSchema.index({ location: 'text', title: 'text', skills: 'text' });
// ↑ Text index for full-text search in Phase 6
// MongoDB's text index tokenizes and stems words, so "engineer" also matches "engineering"

// ─── Model ────────────────────────────────────────────────────────────────────

const Job: Model<IJobDocument> = mongoose.model<IJobDocument>('Job', jobSchema);

export default Job;
