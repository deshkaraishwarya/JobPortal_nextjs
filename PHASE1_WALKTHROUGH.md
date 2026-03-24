# Phase 1 Complete — Project Setup ✅

## What We Built

A complete **monorepo project structure** for JobTrackr with a Next.js 14 frontend and an Express.js TypeScript backend, both configured and ready for development.

## Files Created

### Root Level
| File | Purpose |
|---|---|
| `.gitignore` | Excludes node_modules, .env, dist, .next from git |
| `docker-compose.yml` | One-command dev environment (MongoDB + backend + frontend) |
| `README.md` | Full project documentation with setup instructions |

### Backend (`backend/src/`)
| File | Purpose |
|---|---|
| `app.ts` | Express app factory — middleware stack, routes, error handler |
| `server.ts` | Entry point — connects DB, then starts HTTP server |
| `config/database.ts` | MongoDB connection utility (exported function, not auto-connected) |
| `middleware/auth.ts` | JWT Bearer token verification middleware |
| `middleware/errorHandler.ts` | Custom `ApiError` class + global Express error handler |
| `middleware/asyncHandler.ts` | Wraps async route handlers to prevent unhandled rejections |

### Frontend (`frontend/src/`)
| File | Purpose |
|---|---|
| `app/layout.tsx` | Root layout — font optimization, global metadata, shell |
| `app/page.tsx` | Home page (Server Component) — hero, stats, categories |
| `app/globals.css` | Tailwind layers + CSS design tokens + reusable component classes |
| `lib/api.ts` | Centralized API client with auto JWT attachment |
| `tailwind.config.ts` | Custom brand colors, font variable, animations |

## Key Concepts Learned

### 1. Next.js App Router vs Pages Router

| | App Router (✅ We use this) | Pages Router |
|---|---|---|
| Introduced | Next.js 13+ | Next.js original |
| File convention | `app/page.tsx` | `pages/index.tsx` |
| Default | React Server Components | Client Components |
| Data fetching | `async` components, `fetch()` | `getServerSideProps`, `getStaticProps` |
| Layouts | Nested `layout.tsx` files | `_app.tsx` |
| Metadata | `export const metadata` | `<Head>` tag |

**Why App Router?**
- Closer to React's future (Server Components are the direction React is moving)
- Better performance by default (less JS shipped to browser)
- Nested layouts eliminate layout flicker (no re-render on navigation between same-layout pages)

### 2. SSR vs SSG vs Client-Side Rendering

```
SSR (Server-Side Rendering)
└── render happens on the server at REQUEST TIME
└── Use when: data changes frequently (job listings, live data)
└── Example in our app: /jobs page (will be SSR in Phase 5)

SSG (Static Site Generation)
└── render happens at BUILD TIME once
└── Use when: data rarely changes (about page, categories)
└── Example in our app: /page.tsx home page (current) — no dynamic data yet

Client-Side Rendering (CSR)
└── render happens in the BROWSER using JavaScript
└── Use when: interactive, user-specific, private data
└── Example in our app: Dashboard (Phase 8) — uses "use client"
```

### 3. Why `app.ts` is Separate from `server.ts`

```
app.ts → Express instance (middleware, routes)
    ↓
    Imported in tests via Supertest — no real HTTP server!

server.ts → Connects DB + calls app.listen()
    ↓
    Only runs when you do `npm run dev` or `npm start`
```

This is the **#1 best practice** for testable Express apps.

### 4. Why `asyncHandler` Wrapper Exists

Express 4 doesn't catch errors from `async` functions. Without it:
```ts
// BAD — uncaught rejection crashes process
app.get('/jobs', async (req, res) => {
  const jobs = await Job.find(); // if this throws... 💥
  res.json(jobs);
});

// GOOD — errors forwarded to errorHandler automatically
app.get('/jobs', asyncHandler(async (req, res) => {
  const jobs = await Job.find();
  res.json(jobs);
}));
```

## TypeScript Verification

```
✅ backend: npx tsc --noEmit → 0 errors
✅ frontend: npx tsc --noEmit → 0 errors
```

## How to Run

```bash
# Backend — Terminal 1
cd backend
npm run dev   # starts on http://localhost:5000

# Frontend — Terminal 2
cd frontend
npm run dev   # starts on http://localhost:3000
```

> **Note**: You'll need MongoDB running locally OR comment out DB connection for now.
> Install MongoDB Community Edition or run: `docker run -p 27017:27017 mongo:7`
