import mongoose from 'mongoose';

/**
 * connectDB: Establishes a connection to MongoDB using Mongoose.
 *
 * WHY a separate function?
 * - We can call this from server.ts on startup
 * - We can SKIP calling this in tests (tests use mocks or an in-memory DB)
 * - Centralised connection logic = easy to update (e.g., add retry logic)
 *
 * WHY async/await instead of callbacks?
 * - Cleaner, readable
 * - Allows us to await the connection before listening for HTTP requests
 *   so the server is never "ready" before the DB is connected
 */
export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error; // Let server.ts handle the exit
  }
};

/**
 * disconnectDB: Clean disconnect (used in test teardown).
 * Always close DB connections in tests to avoid "Jest did not exit" warnings.
 */
export const disconnectDB = async (): Promise<void> => {
  await mongoose.connection.close();
};
