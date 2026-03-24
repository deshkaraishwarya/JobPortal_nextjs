import app from './app';
import { connectDB } from './config/database';

const PORT = process.env.PORT || 5000;

/**
 * Why separate app.ts and server.ts?
 *
 * app.ts → Express app configuration (middleware, routes)
 * server.ts → Starts the actual HTTP server and connects to DB
 *
 * This separation means in our Jest tests we can import `app`
 * directly and run Supertest against it WITHOUT starting a real
 * server or connecting to a real database. This is a critical
 * best practice for testable Node.js applications.
 */
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📋 Environment: ${process.env.NODE_ENV}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
