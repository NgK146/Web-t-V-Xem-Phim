import request from 'supertest';
import mongoose from 'mongoose';
import httpServer from '../src/app.js';
import User from '../src/models/User.js';

const TEST_USER = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
};

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/cinema_test');
});

afterAll(async () => {
  await User.deleteMany({ email: TEST_USER.email });
  await mongoose.disconnect();
});

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(httpServer)
        .post('/api/auth/register')
        .send(TEST_USER);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data.user.email).toBe(TEST_USER.email);
    });

    it('should return 400 for duplicate email', async () => {
      const res = await request(httpServer)
        .post('/api/auth/register')
        .send(TEST_USER);
      expect(res.status).toBe(400);
    });

    it('should return 422 for invalid email', async () => {
      const res = await request(httpServer)
        .post('/api/auth/register')
        .send({ ...TEST_USER, email: 'not-an-email' });
      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(httpServer)
        .post('/api/auth/login')
        .send({ email: TEST_USER.email, password: TEST_USER.password });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should return 401 for wrong password', async () => {
      const res = await request(httpServer)
        .post('/api/auth/login')
        .send({ email: TEST_USER.email, password: 'wrongpassword' });
      expect(res.status).toBe(401);
    });
  });
});
