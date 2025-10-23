/**
 * E2E Tests for Authentication Endpoints
 * Tests: /api/auth/register, /api/auth/login, /api/auth/me
 */

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/server';
import { User } from '../../src/models/User';

const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPass123',
  name: 'Test User',
};

const TEST_SELLER = {
  email: 'seller@example.com',
  password: 'SellerPass123',
  name: 'Test Seller',
  role: 'SELLER',
};

// Setup and teardown
beforeAll(async () => {
  // Connect to test database
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/digitaldock-test');
  }
});

afterAll(async () => {
  // Clean up and disconnect
  await User.deleteMany({});
  await mongoose.connection.close();
});

beforeEach(async () => {
  // Clear users before each test
  await User.deleteMany({});
});

describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(TEST_USER)
      .expect(201);

    expect(response.body).toHaveProperty('message', 'User registered successfully');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('email', TEST_USER.email.toLowerCase());
    expect(response.body.user).toHaveProperty('name', TEST_USER.name);
    expect(response.body.user).toHaveProperty('role', 'BUYER');
    expect(response.body).toHaveProperty('token');
    expect(typeof response.body.token).toBe('string');
  });

  it('should register a seller successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(TEST_SELLER)
      .expect(201);

    expect(response.body.user).toHaveProperty('role', 'SELLER');
  });

  it('should fail with invalid email', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ ...TEST_USER, email: 'invalid-email' })
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Validation failed');
  });

  it('should fail with short password', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ ...TEST_USER, password: 'short' })
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Validation failed');
  });

  it('should fail with weak password (no uppercase)', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ ...TEST_USER, password: 'weakpass123' })
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Password is not strong enough');
  });

  it('should fail with weak password (no number)', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ ...TEST_USER, password: 'WeakPassword' })
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Password is not strong enough');
  });

  it('should fail if user already exists', async () => {
    // Register first time
    await request(app).post('/api/auth/register').send(TEST_USER).expect(201);

    // Try to register again
    const response = await request(app)
      .post('/api/auth/register')
      .send(TEST_USER)
      .expect(400);

    expect(response.body).toHaveProperty('error', 'User already exists with this email');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    // Register a user before each login test
    await request(app).post('/api/auth/register').send(TEST_USER);
  });

  it('should login successfully with correct credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: TEST_USER.email,
        password: TEST_USER.password,
      })
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Login successful');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('email', TEST_USER.email.toLowerCase());
    expect(response.body).toHaveProperty('token');
  });

  it('should fail with incorrect password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: TEST_USER.email,
        password: 'WrongPassword123',
      })
      .expect(401);

    expect(response.body).toHaveProperty('error', 'Invalid email or password');
  });

  it('should fail with non-existent email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: TEST_USER.password,
      })
      .expect(401);

    expect(response.body).toHaveProperty('error', 'Invalid email or password');
  });

  it('should fail with invalid email format', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invalid-email',
        password: TEST_USER.password,
      })
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Validation failed');
  });

  it('should fail with missing password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: TEST_USER.email,
      })
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Validation failed');
  });
});

describe('GET /api/auth/me', () => {
  let authToken: string;

  beforeEach(async () => {
    // Register and login to get auth token
    const registerResponse = await request(app).post('/api/auth/register').send(TEST_USER);
    authToken = registerResponse.body.token;
  });

  it('should get current user profile with valid token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('email', TEST_USER.email.toLowerCase());
    expect(response.body.user).toHaveProperty('name', TEST_USER.name);
    expect(response.body.user).toHaveProperty('role');
    expect(response.body.user).toHaveProperty('createdAt');
  });

  it('should fail without authorization header', async () => {
    const response = await request(app).get('/api/auth/me').expect(401);

    expect(response.body).toHaveProperty('error', 'No token provided');
  });

  it('should fail with invalid token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    expect(response.body).toHaveProperty('error', 'Invalid or expired token');
  });

  it('should fail with malformed authorization header', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'InvalidFormat token')
      .expect(401);

    expect(response.body).toHaveProperty('error', 'No token provided');
  });
});

describe('API Health Check', () => {
  it('should return OK for health endpoint', async () => {
    const response = await request(app).get('/health').expect(200);

    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('message', 'DigitalDock API is running');
    expect(response.body).toHaveProperty('timestamp');
  });
});
