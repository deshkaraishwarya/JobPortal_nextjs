# Phase 6 Complete — Search & Filters ✅

## What We Built

We took our static Job Server-Side Rendered (SSR) page and made it deeply interactive by building a **Frontend Filter UI** that synchronizes its state directly with the browser's URL.

## Files Created / Modified

| File | Purpose |
|---|---|
| `components/JobFilters.tsx` | A Client Component containing the form inputs for text search, job type, experience, and remote toggles. |
| `app/jobs/page.tsx` | Updated our SSR job fetching logic to extract the Next.js `searchParams` and forward them directly to the Express backend. |

## Key Concepts Explored

### 1. The Power of `useSearchParams` & `useRouter`
In traditional React apps, you might store your filter state inside `useState` or Redux, and then `fetch` the API under the hood using `useEffect`. This ruins SEO and makes it impossible to share links (like a link to "Only Remote Senior Jobs").

**The Next.js App Router Way:**
1. User types in the search box.
2. `JobFilters` waits 500ms (Debouncing), then builds a new URL string (`?search=foo&isRemote=true`).
3. `router.push('/jobs?...')` modifies the browser URL.
4. Next.js sees the URL change and *automatically* re-executes the Server Component `app/jobs/page.tsx`!
5. Our Server Component gets the new `searchParams`, pipes them to Express, fetches the new JSON, and renders the updated HTML.

**Result:** A fully shareable, SEO-friendly, Server-Side Rendered filter experience.

### 2. Debouncing
We used a basic `setTimeout` inside a React `useEffect` to "debounce" keystrokes.
If a user quickly types "React", we don't want to make 5 separate API calls for "R", "Re", "Rea", "Reac", "React". 
We clear the timer on every keystroke, and only execute the `router.push()` if the user stops typing for 500 milliseconds. This heavily protects our backend from spam requests.

## TypeScript Verification

```
✅ frontend: npx tsc --noEmit → 0 errors
```

## Moving Forward
The user can now view, search, and filter jobs beautifully! Up next is **Phase 7: Apply to Job**, where we cross back into the backend to design the `Application` Mongoose model, wire up an `Apply Now` endpoint, and create the frontend modal.
