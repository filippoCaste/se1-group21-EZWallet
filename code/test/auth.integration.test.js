import request from 'supertest';
import { app } from '../app'; // Your express app
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/User'; // Your User model

dotenv.config();





describe('POST /login', () => {
  beforeAll(async () => {
    const dbName = "testDatabase";
    const url = `${process.env.MONGO_URI}/${dbName}`;
  
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  
    // Hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("securePass", salt);
    
    // Creating a test user
    await User.create({
      email: "mario.red@email.com",
      password: hashedPassword,
      username: "MarioRed", // Added username here
    });
  });
  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });
  it('should successfully log in a user', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({
        email: "mario.red@email.com",
        password: "securePass",
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('accessToken');
    expect(response.body.data).toHaveProperty('refreshToken');
  });

  it('should return 400 if request body is incomplete', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({
        email: "mario.red@email.com",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Incomplete request body");
  });

  it('should return 400 if fields are empty', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({
        email: " ",
        password: " ",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Empty fields are not allowed");
  });

  it('should return 400 if email format is invalid', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({
        email: "invalid email",
        password: "securePass",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid email format");
  });

  it('should return 400 if email does not identify a user in the database', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({
        email: "wrong.email@email.com",
        password: "securePass",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("please you need to register");
  });

  it('should return 400 if the supplied password does not match with the one in the database', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({
        email: "mario.red@email.com",
        password: "wrongPassword",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("wrong credentials");
  });
});

describe('GET /logout', () => {
  let hashedPassword;
  let refreshTokenValid;

  beforeAll(async () => {
    const dbName = "testDatabase";
    const url = `${process.env.MONGO_URI}/${dbName}`;

    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Hashing password
    const salt = await bcrypt.genSalt(10);
    hashedPassword = await bcrypt.hash("securePass", salt);

    // Creating a test user
    await User.create({
      email: "mario.red@email.com",
      password: hashedPassword,
      username: "MarioRed",
    });

    refreshTokenValid = jwt.sign({
      email: "mario.red@email.com",
      username: "MarioRed",
      role: "Regular"
    }, process.env.ACCESS_KEY, { expiresIn: '7d' });

    // Assigning refresh token to test user
    const testUser = await User.findOne({ email: "mario.red@email.com" });
    testUser.refreshToken = refreshTokenValid;
    await testUser.save();
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  // Test Case 1: Successful logout
  it('should successfully log out a user', async () => {
    const res = await request(app)
      .get('/api/logout')  // updated to .get from .post
      .set('Cookie', `refreshToken=${refreshTokenValid}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('message', 'User logged out');
  });

  // Test Case 2: Failure due to lack of refresh token in the request's cookies
  it('should fail to log out due to no refresh token', async () => {
    const res = await request(app).get('/api/logout');  // updated to .get from .post

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'No refresh token provided');
  });

  // Test Case 3: Failure due to non-existent user represented by the refresh token
  it('should fail to log out due to invalid refresh token', async () => {
    const res = await request(app)
      .get('/api/logout')  // updated to .get from .post
      .set('Cookie', `refreshToken=invalidToken`);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'User not found');
  });

  // Test Case 4: Full flow from registration to logout
  test('should successfully log out a user', async () => {
    // 1. Register a new user
    let response = await request(app)
      .post('/api/register')
      .send({ email: 'john@doe.com', password: 'password', username: 'john' });
    
    expect(response.statusCode).toEqual(200);

    // 2. Login the registered user
    response = await request(app)
      .post('/api/login')
      .send({ email: 'john@doe.com', password: 'password' });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('accessToken');
    expect(response.body.data).toHaveProperty('refreshToken');

    const { accessToken, refreshToken } = response.body.data;

    // 3. Logout the logged in user
    response = await request(app)
      .get('/api/logout')  // updated to .get from .post
      .set('Cookie', `accessToken=${accessToken}; refreshToken=${refreshToken}`);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('message', 'User logged out');
  });
});

