# Phase 5 Complete — Next.js 14 App Router UI ✅

## What We Built

We fully connected our React Frontend to our Node.js Backend using the **Next.js 14 App Router**. 
We built:
1. A global `<Navbar />` with authentication state.
2. Robust `loading.tsx` and `error.tsx` boundaries to handle visual fallbacks.
3. Server-Side Rendered (SSR) Job boards at `/jobs` and `/jobs/[id]`.
4. Client-Side Authentication forms at `/login` and `/register`.

## Key Concepts Explored

### 1. Server Components vs Client Components
By default in Next.js 14, **everything** is a Server Component. It renders on the Node.js server and sends pure HTML to the browser, making the site blazing fast and great for SEO.

We only declared `'use client'` at the top of a file when we needed interactivity:
- `Navbar.tsx`: Because it uses `usePathname()` to highlight links, and handles `onClick` logouts.
- `login/page.tsx`: Because it has `<form onSubmit={...}>` and uses React `useState` to track the email/password fields.

### 2. SSR (Server-Side Rendering) vs SSG (Static Site Generation)
In `app/jobs/page.tsx`, we fetched our jobs like this:
```typescript
fetch('http://localhost:5000/api/jobs', { cache: 'no-store' })
```
- **SSR (`no-store`)**: Tells Next.js to fetch the jobs natively *upon every request*. This is vital for a Job Board because jobs are added and removed constantly.
- **SSG (`force-cache`)**: The default behavior. Next.js would fetch the jobs *once* during deployment (`npm run build`). This is great for a blog, but terrible for dynamic data like Job Boards!

### 3. Special App Router Files
- `layout.tsx`: Acts as the app's shell. It never un-mounts when users navigate pages, making it the perfect place to put our global `<Navbar />`.
- `loading.tsx`: Automatically wraps all downstream pages in `React.Suspense`. Because our `getJobs()` fetch is asynchronous on the server, Next.js instantly paints our spinning "Loading JobTrackr" UI while it waits for the server response! No more manual `if (loading) return <Spinner/>` needed!
- `error.tsx`: Acts as a fallback React Error Boundary. If the API crashes, or our component throws an error, Next.js catches it and renders our "Something went wrong!" UI instead of a blank white screen.

### 4. Dynamic SEO Metadata
In `app/jobs/[id]/page.tsx`, we exported `generateMetadata`. Next.js runs this before rendering the HTML to inject specific details into the `<head>`.
If you link a job on Twitter, it won't just say *JobTrackr*, it will actually read: *Apply for the Senior React Developer position at Google in New York!*

## TypeScript Verification

```
✅ frontend: npx tsc --noEmit → 0 errors
```

Let's pat ourselves on the back! The core App is now fully end-to-end operational. In **Phase 6**, we're going to supercharge this UI by building out the frontend search and filter components.
