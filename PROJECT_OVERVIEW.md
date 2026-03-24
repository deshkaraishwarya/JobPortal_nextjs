# JobTrackr: Technical Project Overview 🚀

This document provides a high-level summary of the JobTrackr project, its architecture, and implementation details for technical discussions and interviews.

## 1. Project Mission
JobTrackr is a full-stack job portal designed to connect employers with job seekers. It emphasizes security, performance (SSR), and building a robust, developer-friendly API.

## 2. Technical Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS.
- **Backend**: Express.js, TypeScript.
- **Database**: MongoDB with Mongoose (ODM).
- **Environment**: Docker & Docker Compose for orchestration.
- **Testing**: Jest & Supertest.

## 3. Project Structure
```text
Job Portal/                   # ROOT
├── backend/                  # Express API
│   ├── src/
│   │   ├── config/           # DB & Env configuration
│   │   ├── controllers/      # API Request handlers (Business Logic)
│   │   ├── middleware/       # Auth, Errors, Validation
│   │   ├── models/           # Mongoose Schemas (Data Definitions)
│   │   ├── routes/           # Express endpoint definitions
│   │   └── __tests__/        # Automated Test Suite (Jest)
│   ├── .env                  # Environment Variables
│   └── package.json
├── frontend/                 # Next.js Application (App Router)
│   ├── src/
│   │   ├── app/              # Routing (Pages, Layouts)
│   │   ├── components/       # UI Components
│   │   └── lib/              # Shared logic (API client)
│   ├── .env.local            # Local API URL config
│   └── package.json
├── docker-compose.yml        # Multi-container orchestration
└── PROJECT_OVERVIEW.md        # This guide!
```

## 4. Core Features & Implementation
### 🔐 Authentication & Security
- **JWT-based Auth**: Stateless authentication using JSON Web Tokens.
- **Role-Based Access Control (RBAC)**: Middleware handles different permissions for `employer` and `jobseeker`.
- **Password Security**: Bcrypt for hashing passwords with a salt factor of 10.
- **Security Headers**: Helmet.js for protection against common web vulnerabilities.

### 💼 Job Management
- **Full CRUD**: Employers can create/update/delete jobs.
- **Advanced Search**: Implementation of MongoDB `$text` search and Regex-based location filtering.
- **Server-Side Rendering (SSR)**: Job listings and details are fetched on the server for speed and SEO.

### 📊 Application Tracking
- **Interaction**: Jobseekers can apply to listings with a single click.
- **Dashboards**: Real-time tracking of applications for seekers and applicant counts for employers.

## 4. Architectural Highlights
### 🏗️ MVC-ish Backend Pattern
The backend is organized into:
- **Models**: Mongoose schemas defining data structure.
- **Routes**: API endpoint definitions.
- **Controllers**: Business logic and database interactions.
- **Middleware**: Reusable logic for Auth, Error Handling, and Validation.

### ⚡ Centralized Error Handling
A global `errorHandler` middleware translates complex backend errors (Mongoose validation, duplicate keys) into friendly JSON responses for the frontend.

### 🐳 Containerized Development
- **Docker Compose**: Orchestrates three services: `backend`, `frontend`, and `mongodb`.
- **Networking**: Implemented a dual-URL strategy (`NEXT_PUBLIC_API_URL` for the browser and `INTERNAL_API_URL` for server-side communication inside the Docker network).

## 5. Development Best Practices
- **TypeScript First**: Strict typing across both frontend and backend to catch bugs at compile time.
- **Automated Testing**: 100% test coverage on critical API paths (Auth/Jobs) with automated database cleanup between tests.
- **Clean UI**: Premium, responsive design using Tailwind's utility-first classes.
