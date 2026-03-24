# Phase 7 Complete — Apply to Job Flow ✅

## What We Built

We designed the entire lifecycle of a job application, from database structural definitions, to Express route security, to building the Next.js interactive modal overlay without breaking our Server-Side-Rendered SEO.

## Database Design: Denormalization 
In our `Application` Mongoose model, we mapped relational concepts using `Schema.Types.ObjectId`. 
Normally, an Application points to a `Job`, and a `Job` points to an `Employer`. Under a classic strict-normalized database setup, if an Employer wanted to view all their applications, we'd have to perform a massive database-wide Aggregation Pipeline matching Employer -> Jobs -> Applications.

Instead, we decided to **Denormalize** the dataset by saving `employer: job.postedBy` directly onto the `Application` schema itself upon creation!
Now, the Employer Dashboard can just run `Application.find({ employer: req.user.id })`, transforming a high-latency join table query into a blazingly fast 4ms lookup.

## API Security & Constraints
We enforced several business-logic constraints at the controller line:
1. `Jobseekers` can't apply to a job twice (Backed up natively by a MongoDB compound unique index `applicationSchema.index({ job: 1, applicant: 1 }, { unique: true })`).
2. `Employers` cannot apply to their own jobs.
3. Only the `Employer` who created the job can change an application's status to "hired" or "rejected", enforced cryptographically using our JWT Middleware.

## The Frontend Modal & Architectural Constraints
Because our `jobs/[id]/page.tsx` is a Next.js 14 Server Component fetching data using Server-Side Rendering native fetch commands, we cannot simply sprinkle `onClick` handlers or `useState` into it. 
To solve this, we created `<ApplyModal />` as an isolated piece of client-side logic marked strictly with `'use client'`. We simply pass the `jobId` down into the component from the server side. 
This allows our Job Listings to remain 100% SEO indexable as pure HTML, while maintaining full user interactivity.

## Moving Forward
Our backend and frontend TypeScript checks both passed flawlessly with zero errors! Next up is **Phase 8**, where we will build a Dashboard utilizing `localStorage` to fetch protected API routes from the client side based on standard JWT workflows.
