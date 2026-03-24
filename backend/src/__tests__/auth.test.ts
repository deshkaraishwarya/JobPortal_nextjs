import request from 'supertest';
import app from '../app'; // Default export

describe('Auth API Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should successfully register a new user and return a JWT token', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Employer',
          email: 'test@employer.com',
          password: 'password123',
          role: 'employer',
        });

      // Verify success status
      expect(response.status).toBe(201);
      
      // Verify body format
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@employer.com');
      
      // Verify password wasn't returned
      expect(response.body.user.password).toBeUndefined();
    });

    it('should fail if email is already registered', async () => {
      // Register first time
      await request(app).post('/api/auth/register').send({
        name: 'Test', email: 'duplicate@test.com', password: 'password', role: 'jobseeker'
      });

      // Try registering again
      const response = await request(app).post('/api/auth/register').send({
        name: 'Test 2', email: 'duplicate@test.com', password: 'password', role: 'jobseeker'
      });

      // Verify Failure Status
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/already exists/);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should successfully login and return a JWT', async () => {
      // 1. Arrange (Register a user)
      await request(app).post('/api/auth/register').send({
        name: 'Login Test', email: 'login@test.com', password: 'securepassword', role: 'jobseeker'
      });

      // 2. Act (Try to login)
      const response = await request(app).post('/api/auth/login').send({
        email: 'login@test.com',
        password: 'securepassword'
      });

      // 3. Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
    });
  });
});
