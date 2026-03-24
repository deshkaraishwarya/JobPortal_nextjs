import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// ─── Why TypeScript Interfaces for Mongoose? ──────────────────────────────────
//
// Mongoose itself is JavaScript — it doesn't know your field types at compile
// time. By defining an interface that extends Document, TypeScript can:
//   ✅ Autocomplete field names (user.email, user.name)
//   ✅ Catch typos at compile time (user.email vs user.Email)
//   ✅ Type-check method returns (comparePassword returns Promise<boolean>)
//
// We split into TWO interfaces:
//   IUser          → plain data shape (for creating documents, req.body typing)
//   IUserDocument  → data + Mongoose Document methods + our custom methods
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole = 'jobseeker' | 'employer';

// Plain data shape — used when typing req.body or creating a new user
export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Full Mongoose document — extends IUser + Document (gives .save(), .toJSON(), etc.)
export interface IUserDocument extends IUser, Document {
  /**
   * comparePassword: Instance method to safely check a plain-text password
   * against the stored bcrypt hash. Keeps hashing logic inside the model.
   *
   * Usage in a controller:
   *   const user = await User.findOne({ email });
   *   const isMatch = await user.comparePassword('mypassword123');
   */
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ─── Schema ───────────────────────────────────────────────────────────────────
//
// Schema = the BLUEPRINT of a document (like a SQL table definition).
// Model  = the CLASS you use to query/create documents (like a SQL table object).
//
// Think of it as:
//   Schema → what a user document looks like
//   Model  → User.find(), User.create(), User.findById()
// ─────────────────────────────────────────────────────────────────────────────

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,                // removes leading/trailing whitespace
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,              // ← creates a MongoDB index (see note below)
      lowercase: true,           // always stores email in lowercase
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,             // ← NEVER returned in queries by default
      //
      // WHY select: false?
      // By default, User.findOne({ email }) would include the hashed password
      // in the result. That's a security risk if you accidentally send the
      // whole user object to the frontend. With select: false, you'd have to
      // explicitly opt-in: User.findOne({ email }).select('+password')
      //
    },

    role: {
      type: String,
      enum: {
        values: ['jobseeker', 'employer'],
        message: 'Role must be either jobseeker or employer',
      },
      default: 'jobseeker',
    },

    avatar: {
      type: String,
      default: '',
    },
  },
  {
    // ─── Schema Options ────────────────────────────────────────────────────
    timestamps: true,
    // timestamps: true → Mongoose automatically adds:
    //   createdAt: Date  (when document was first created)
    //   updatedAt: Date  (when document was last modified)
    // You NEVER have to set these manually!

    toJSON: {
      transform(_doc, ret: any) {
        // Remove password and __v from JSON output even if accidentally fetched
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
//
// The `unique: true` on email already creates an index, but let's add a
// compound text index for future search functionality.
//
// WHY indexes?
// Without an index, MongoDB scans EVERY document for queries (O(n)).
// With an index, MongoDB uses a B-tree lookup (O(log n)).
// For a job board with 50,000 users, that's the difference between
// milliseconds and seconds!
//
userSchema.index({ role: 1 });   // index on role (for "find all employers" queries)

// ─── Pre-Save Hook ────────────────────────────────────────────────────────────
//
// A pre-save hook runs BEFORE a document is saved to MongoDB.
// This is the perfect place for password hashing because:
//   1. It runs automatically — you can't forget to hash
//   2. It only runs when needed (we check isModified)
//   3. The schema is the single source of truth for this logic
//
// Flow: user.save() → pre('save') fires → bcrypt hashes password → saved to DB
//
// Note: In modern Mongoose, async functions return a Promise, so we don't
// need the `next` callback anymore.
//
userSchema.pre('save', async function () {
  // `this` refers to the document being saved

  // Only hash if password was actually changed (not on unrelated updates)
  // e.g., if a user updates their name, we don't re-hash the existing hash!
  if (!this.isModified('password')) {
    return;
  }

  // saltRounds = 12: the "work factor" for bcrypt.
  // Higher = more secure but slower. 10-12 is the industry standard.
  // At 12 rounds, hashing takes ~300ms — too slow to brute-force but
  // barely noticeable to a real user logging in.
  const saltRounds = 12;
  this.password = await bcrypt.hash(this.password, saltRounds);
});

// ─── Instance Methods ─────────────────────────────────────────────────────────
//
// Instance methods are available on every document instance.
// We use a regular function (not arrow) so `this` refers to the document.
//
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  // bcrypt.compare handles the salt extraction from the stored hash automatically
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Model ────────────────────────────────────────────────────────────────────
//
// We pass IUserDocument as generic so TypeScript knows:
//   User.findOne() → returns IUserDocument | null
//   new User({})   → returns IUserDocument
//
// The `Model<IUserDocument>` type is the "class" type for static methods.
//
const User: Model<IUserDocument> = mongoose.model<IUserDocument>(
  'User',   // Collection name in MongoDB will be 'users' (lowercased + pluralized)
  userSchema
);

export default User;
