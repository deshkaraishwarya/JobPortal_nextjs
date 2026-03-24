# Phase 3 Complete — JWT Authentication APIs ✅

## What We Built

We successfully built the **Authentication System** using JSON Web Tokens (JWT). The API can now handle Jobseeker and Employer registrations, securely log them in, and verify their sessions!

## Files Created / Modified

### Backend (`backend/src/`)
| File | Purpose |
|---|---|
| `controllers/auth.controller.ts` | The core business logic for `register`, `login`, and `getMe` endpoints. Generates the JWTs. |
| `routes/auth.routes.ts` | Maps the Express routes to the controller, and applies `express-validator` middleware to sanitize/check inputs. |
| `app.ts` | Mounted `authRoutes` to `app.use('/api/auth', ...)` |

## Key Concepts Learned

### 1. The JWT Authentication Flow
A JSON Web Token (JWT) is essentially a signed "VIP pass". It proves that the server previously authenticated the user, preventing them from having to send their password on every request.

**Registration / Login Flow:**
1. User sends email/password to `/api/auth/login`.
2. Server verifies credentials via `bcrypt.compare` (in our Mongoose model).
3. Server generates a token containing the user's ID (`jwt.sign({ userId }, secret)`).
4. Server sends token back to client.

**Authenticated Request Flow (Next Phase):**
1. Client stores token in localStorage or cookies.
2. Client sends token in header: `Authorization: Bearer <token>`
3. Server's `authenticate` middleware (built in Phase 1) reads it, verifies the signature (`jwt.verify`), and extracts the `userId`.
4. The endpoint executes securely.

### 2. Express-Validator for Early Failure
In `auth.routes.ts`, we added `check('email', 'Invalid email').isEmail()` directly in the route declaration.
**Why?**
Validation should happen at the absolute edge of your application (the route layer). If the request is malformed, we reject it *before* it ever reaches the controller or the database. It prevents unnecessary DB queries and keeps controllers clean.

### 3. Separation of Concerns (Routes vs. Controllers)
- **Routes (`auth.routes.ts`)**: Responsible for "traffic directing" and input validation. "If you ask for `POST /login`, and your input is valid, I'll send you to the auth controller."
- **Controllers (`auth.controller.ts`)**: Responsible for "business logic". "I'll take your valid input, interact with the Database models, process a token, and send a JSON response."

### 4. Avoiding Security Pitfalls
- **Don't leak passwords**: We used `user.toJSON()` (which utilizes our `select: false` model transform) so we don't accidentally send the hashed password to the React frontend.
- **Don't leak user existence**: When a login fails, we return generic "Invalid email or password", even if the email doesn't exist. This prevents attackers from "enumerating" our user database by guessing emails.

## TypeScript Verification

```
✅ backend: npx tsc --noEmit → 0 errors
```

## Ready for Phase 4!
The authentication foundation is set. In **Phase 4**, we'll build the massive **Job CRUD APIs** (Create, Read, Update, Delete) allowing employers to post jobs and users to view them using full pagination and filtering.
