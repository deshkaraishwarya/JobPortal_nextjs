# Phase 9 Complete — Jest Unit Testing ✅

## What We Built

We implemented a full test suite utilizing **Jest** and **Supertest** to programmatically invoke and assert our Express API logic, completely independent from our frontend browser interfaces.

## Key Concepts Explored

### 1. The Power of Supertest
The `supertest` package allows us to wrap our exported Express `app` without actually binding it to a port (`app.listen(5000)`). 

```typescript
const response = await request(app)
  .post('/api/auth/register')
  .send({ ...body });
```

This simulates a real HTTP request coming through our middleware (body parsing, cors, helmet) and running through all our Validation checks and Controllers.

### 2. Isolated Database Environments
If we test our application by hitting the *same* MongoDB Database we use for development (`JobTrackr`), we run a massive risk of wiping real data during tearing down routines.

To solve this, we used a Jest Global Setup file `setup.ts`:
```typescript
const TEST_MONGO_URI = process.env.MONGO_URI.replace('JobTrackr', 'JobTrackr_test');
```
We also used `afterEach` to iterate and `deleteMany()` across all collections. This ensures that every `it()` block runs in a perfectly pristine, blank MongoDB database to prevent state-pollution across tests.

### 3. Testing RBAC Security 
In `job.test.ts`, we generated two distinct Users in the `beforeAll` block: one Jobseeker and one Employer. We saved their JWTs to memory variables. Check out the behavior testing:
- **Valid Authorization:** `post('/api/jobs').set('Authorization', Bearer ${employerToken})` works flawlessly!
- **Invalid Authorization:** `post('/api/jobs').set('Authorization', Bearer ${jobseekerToken})` is intercepted successfully by our RBAC middleware and returns a `403 Forbidden`!

## Moving Forward
Our tests are running flawlessly. Next is **Phase 10: Docker Compose**, where we spin up the Node and Next images side-by-side using containerization!
