import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../app';

dotenv.config();

// Connect to a specific TEST database to avoid nuking production/dev data
const TEST_MONGO_URI = process.env.MONGODB_URI 
  ? process.env.MONGODB_URI.replace('jobtrackr', 'jobtrackr_test')
  : 'mongodb://localhost:27017/jobtrackr_test';

beforeAll(async () => {
  await mongoose.connect(TEST_MONGO_URI);
});

// Clear all databases between tests to keep isolation
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});
