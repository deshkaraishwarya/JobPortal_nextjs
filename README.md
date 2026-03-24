# JobTrackr

A modern, full-stack Job Board application built from the ground up utilizing the latest React paradigms and robust backend architectures.

## Architecture Stack

| Component | Technology | Description |
|---|---|---|
| **Frontend** | **Next.js 14 (App Router)** | Utilizes deeply integrated React Server Components (RSC) for blazingly fast Server-Side Rendered (SSR) job listings with zero layout shift, coupled with localized `'use client'` interactive search filters. |
| **Styling** | **Tailwind CSS** | Highly customizable utility-first CSS framework natively integrated into the Next.js compilation step. |
| **Backend** | **Node.js & Express** | Highly modularized REST API featuring custom `asynchandler` wrappers and strict global error-boundary catchers. |
| **Database** | **MongoDB & Mongoose** | Featuring relational `ObjectId` population, heavy read-query denormalization for the Dashboard, and `Compound Unique Indexes` blocking duplicate applications natively. |
| **Auth** | **JSON Web Tokens (JWT)** | Custom stateless RBAC (Role-Based Access Control) authentication pipeline verifying `Jobseeker` vs `Employer` execution contexts natively. |
| **Testing** | **Jest & Supertest** | Native in-memory execution mocking the Express HTTP lifecycle across pristine virtualized MongoDB clusters. |
| **DevOps** | **Docker & Docker Compose** | 1-click execution bridging all three components together over an internal virtual network. |

## Quick Start (Docker)

The absolute easiest way to boot JobTrackr is via Docker Compose:

```bash
docker-compose up --build
```
This single command spins up:
1. A fresh MongoDB database (Persisted via Docker volumes).
2. The Express Backend at `http://localhost:5000`.
3. The Next.js Frontend at `http://localhost:3000`.

## Manual Setup

If you wish to run the environments manually:

**1. MongoDB**
Ensure you have MongoDB running locally or via MongoDB Atlas.

**2. Backend Setup**
```bash
cd backend
npm install
# Ensure you copy .env.example to .env
npm run dev
```

**3. Frontend Setup**
```bash
cd frontend
npm install
# Ensure you copy .env.example to .env.local
npm run dev
```

## Running the API Tests

The backend ships with full E2E Jest coverage utilizing Supertest.

```bash
cd backend
npm run test
```

