# Phase 2 Complete — MongoDB Models ✅

## What We Built

We created robust, TypeScript-safe **Mongoose Models** for the two core entities in our application: **Users** and **Jobs**.

## Files Created

### Backend Models (`backend/src/models/`)
| File | Purpose |
|---|---|
| `User.ts` | The User schema with password hashing, `comparePassword` method, and `select: false` security. |
| `Job.ts` | The Job schema with embedded salary sub-documents, rigorous validation, and pre-defined indexes for searching. |

## Key Concepts Learned

### 1. Mongoose Schemas vs. Models vs. Documents
- **Schema**: The blueprint of your data structure (what fields exist, required vs optional, max length).
- **Model**: The compiled "Class" based on the Schema. You use it to query the database (`User.find()`, `User.create()`).
- **Document**: An individual instance of a Model (a single user record). It has instance methods (`user.save()`).

### 2. Typing Mongoose with TypeScript
Mongoose isn't natively typed because it's built for JavaScript. We fix this by defining two interfaces:
1. `IUser` – To define the pure data shape (great for typing `req.body` later).
2. `IUserDocument extends IUser, Document` – To give us autocomplete for Mongoose properties (`_id`, `__v`) and instance methods (`comparePassword()`).

### 3. Pre-save Hooks & `bcrypt`
Instead of hashing passwords inside controllers, we put the logic in a **Pre-save hook** directly on the model (`userSchema.pre('save', ...)`).
**Why?**
1. **Single Source of Truth**: You can't accidentally forget to hash a password, regardless of which controller creates the user.
2. **Efficiency**: It only re-hashes if `this.isModified('password')` is true.

### 4. `select: false` Security
In the `User` schema, we added `select: false` to the password field. This prevents Mongoose from returning the hashed password when doing queries like `User.find()`. To get the password (like during login validation), we must explicitly request it: `User.findOne({ email }).select('+password')`.

### 5. Denormalization (The MongoDB Way)
In our `Job` schema, we added an `applicationCount` field. 
Instead of doing a slow `Application.countDocuments({ jobId })` every time a user views the job board, we simply increment `applicationCount` by `1` when they apply. This speeds up Read operations massively at the cost of a tiny Write overhead.

### 6. Indexing for Search & Filtering
A database table without an index is like a textbook without an index at the back — you have to flip through every page to find a word (O(n) scan). By defining `jobSchema.index({ status: 1, createdAt: -1 })` and textual indexes, we tell MongoDB to map these values into a fast B-tree (O(log n) lookup). 

## TypeScript Verification

```
✅ backend: npx tsc --noEmit → 0 errors
```

## Ready for Phase 3!
We are now fully prepared to build our JWT Authentication endpoints using the robust User schema we just created!
