import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables BEFORE anything else
// This ensures process.env.MONGODB_URI etc. are available everywhere
dotenv.config();

const app: Application = express();

// ─── Middleware ────────────────────────────────────────────────────────────────

/**
 * helmet: Sets various HTTP headers to protect your app.
 * For example, it sets X-Frame-Options to prevent clickjacking.
 * Think of it as a security seal for your Express app.
 */
app.use(helmet());

/**
 * cors: Allows your Next.js frontend (on port 3000) to talk to this server
 * (on port 5000). Without this, browsers block cross-origin requests.
 * The 'credentials: true' option allows cookies/auth headers to be sent.
 */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

/**
 * express.json(): Parses incoming JSON request bodies.
 * Without this, req.body would be undefined when a client sends JSON.
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * morgan: HTTP request logger. In 'dev' mode it logs:
 * METHOD URL STATUS RESPONSE_TIME BYTES
 * Example: POST /api/auth/login 200 12.345 ms - 256
 * Very useful for debugging!
 */
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Health Check ──────────────────────────────────────────────────────────────

/**
 * A simple health check endpoint.
 * Used by Railway/Docker to verify the server is alive.
 */
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'JobTrackr API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────────
import authRoutes from './routes/auth.routes';
import jobRoutes from './routes/job.routes';
import applicationRoutes from './routes/application.routes';

// Mount the auth routes precisely at /api/auth
app.use('/api/auth', authRoutes);

// We'll add our job route files here in upcoming phases:
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

/**
 * Global Error Handler — MUST be registered LAST.
 * Express identifies it by the 4-parameter signature (err, req, res, next).
 * Any error thrown or passed to next(err) anywhere in the app ends up here.
 */
app.use(errorHandler);

export default app;
