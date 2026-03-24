import request from 'supertest';
import app from '../app';

describe('Job API Endpoints', () => {
  let employerToken = '';
  let jobseekerToken = '';
  let jobId = '';

  beforeAll(async () => {
    // 1. Create an Employer
    const empRes = await request(app).post('/api/auth/register').send({
      name: 'Employer User', email: 'emp@test.com', password: 'password', role: 'employer'
    });
    employerToken = empRes.body.token;

    // 2. Create a Jobseeker
    const jsRes = await request(app).post('/api/auth/register').send({
      name: 'Seeker User', email: 'seeker@test.com', password: 'password', role: 'jobseeker'
    });
    jobseekerToken = jsRes.body.token;
  });

  describe('POST /api/jobs', () => {
    it('should successfully create a job if user is an employer', async () => {
      const response = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${employerToken}`)
        .send({
          title: 'Jest Developer',
          company: 'Test Corp',
          location: 'Remote',
          description: 'Writing cool tests with Jest and Supertest to ensure our Job board is robust and reliable and scalable for thousands of users.',
          salary: { min: 80000, max: 120000 },
          jobType: 'full-time',
          experienceLevel: 'mid',
          isRemote: true
        });

      expect(response.status).toBe(201);
      expect(response.body.job.title).toBe('Jest Developer');
      jobId = response.body.job._id; // Save for next tests
    });

    it('should fail if user is a jobseeker (RBAC)', async () => {
      const response = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${jobseekerToken}`)
        .send({
          title: 'Hacker',
          company: 'Bad Corp',
          location: 'Anywhere',
          description: 'trying to break RBAC',
          salary: { min: 1, max: 2 },
          jobType: 'contract',
          experienceLevel: 'entry'
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch(/Must be an employer/);
    });
  });

  describe('GET /api/jobs', () => {
    it('should fetch all jobs (public endpoint)', async () => {
      // Create a job first because afterEach clears the DB
      await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${employerToken}`)
        .send({
          title: 'GET Test Job',
          company: 'Test Corp',
          location: 'Remote',
          description: 'This is a long enough description to satisfy the Mongoose validation rule of fifty characters.',
          salary: { min: 50000, max: 100000 },
          jobType: 'full-time',
          experienceLevel: 'entry',
          isRemote: true
        });

      const response = await request(app).get('/api/jobs');
      expect(response.status).toBe(200);
      expect(response.body.jobs.length).toBeGreaterThan(0);
      expect(response.body.jobs[0].title).toBe('GET Test Job');
    });
  });
});
