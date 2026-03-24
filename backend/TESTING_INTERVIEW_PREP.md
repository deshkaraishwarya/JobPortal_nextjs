# JobTrackr: Backend Testing Interview Prep 🧪

This document summarizes the testing strategy and technical decisions made for the Job Portal backend. Use this to explain your work during an interview.

## 1. The Strategy: Integrated Testing
Rather than just "Unit Testing" (testing functions in isolation), we used **Integration Testing** with **Supertest**. 
- **WHY?** In a REST API, you want to verify that the **Route + Middleware + Controller + Database** all work together. Testing just the controller function would miss bugs in authentication or database constraints.

## 2. Tech Stack
- **Jest**: The test runner and assertion library.
- **Supertest**: Simulates HTTP requests (GET, POST, etc.) to the Express app without needing a real server running on a port.
- **MongoDB**: A dedicated, isolated test database (`JobTrackr_test`) ensures tests don't touch production data.

## 3. Core Testing Patterns
- **Database Isolation**: We use `src/__tests__/setup.ts` to:
  - Connect to a clean test DB before any tests run (`beforeAll`).
  - **Wipe all collections** after *every single test* (`afterEach`). This ensures each test is "idempotent" (starts with a blank slate).
- **Environment Management**: Used `dotenv` and `NODE_ENV=test` to swap between production and test configurations.

## 4. Key Scenarios Covered
- **Authentication**: Verified registration (duplicate email checks) and JWT issuance/verification.
- **RBAC (Role-Based Access Control)**: Verified that a user with a `jobseeker` role is **forbidden (403)** from posting a job, while an `employer` is permitted.
- **Data Validation**: Confirmed that Mongoose schema constraints (like minimum description length or required fields) return correct **400 Bad Request** errors.

## 5. Interview "Pro-Tips"
- **"What was the hardest part?"**: Mentioning the **Docker networking fix**. Server-side components (Next.js) couldn't talk to `localhost` inside a container, so we implemented an `INTERNAL_API_URL` to let containers communicate via the internal bridge network.
- **"Why not use Mongoose-Mock?"**: Explain that using a **real MongoDB instance** (even for tests) is more reliable because it catches actual schema validation and index errors that mocks often miss.
