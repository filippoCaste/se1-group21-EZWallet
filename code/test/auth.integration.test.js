import request from 'supertest';
import { app } from '../app';
import { categories } from '../models/model';
import { transactions } from '../models/model';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import { User, Group } from '../models/User';
import jwt from 'jsonwebtoken';
import { verifyAuth, handleDateFilterParams } from '../controllers/utils';
import bcrypt from 'bcryptjs'

dotenv.config();

beforeAll(async () => {
  const dbName = "testingDatabaseAuth";
  const url = `${process.env.MONGO_URI}/${dbName}`;

  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});
beforeEach(async () => {
  await categories.deleteMany({})
  await transactions.deleteMany({})
  await User.deleteMany({})
  await Group.deleteMany({})
})
describe('POST /api/register', () => {

  // Test for missing parameters
  it('should return 400 if username, email or password are missing', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ username: "Mario", email: "mario.red@email.com" });
    expect(res.statusCode).toEqual(400);
  });

  // Test for empty string parameters
  it('should return 400 if username, email or password are empty strings', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ username: "", email: "", password: "" });
    expect(res.statusCode).toEqual(400);
  });

  // Test for invalid email format
  it('should return 400 if email is not in a valid format', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ username: "Mario", email: "invalid.email", password: "securePass" });
    expect(res.statusCode).toEqual(400);
  });

  // Test for username already in use
  it('should return 400 if username already exists', async () => {
    // Add a user to the database
    const hashedPassword = await bcrypt.hash("securePass", 12);
    await User.create({ username: "Mario", email: "mario.red@email.com", password: hashedPassword });

    // Try to register with the same username
    const res = await request(app)
      .post('/api/register')
      .send({ username: "Mario", email: "different.email@email.com", password: "securePass" });
    expect(res.statusCode).toEqual(400);
  });

  // Test for email already in use
  it('should return 400 if email already exists', async () => {
    // Add a user to the database
    const hashedPassword = await bcrypt.hash("securePass", 12);
    await User.create({ username: "Mario", email: "mario.red@email.com", password: hashedPassword });

    // Try to register with the same email
    const res = await request(app)
      .post('/api/register')
      .send({ username: "Luigi", email: "mario.red@email.com", password: "securePass" });
    expect(res.statusCode).toEqual(400);
  });

  // Test for successful user registration
  it('should return 200 and confirm user was added successfully', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ username: "Mario", email: "mario.red@email.com", password: "securePass" });
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.message).toEqual("User added successfully");
  });

  

});


describe('registerAdmin', () => {
  // Test when all fields are correct
  it('should register a new admin user', async () => {
    const res = await request(app)
      .post('/api/admin')
      .send({
        username: 'admin',
        email: 'admin@test.com',
        password: 'securePassword',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.message).toEqual('Admin added successfully');

    const user = await User.findOne({ username: 'admin' });
    expect(user).not.toBeNull();
  });

  // Test when not all necessary fields are provided
  it('should return 400 when missing fields', async () => {
    const res = await request(app)
      .post('/api/admin')
      .send({
        email: 'admin@test.com',
        password: 'securePassword',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('Incomplete request body');
  });

  // Test when fields are empty strings
  it('should return 400 when fields are empty strings', async () => {
    const res = await request(app)
      .post('/api/admin')
      .send({
        username: '',
        email: 'admin@test.com',
        password: 'securePassword',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('Empty fields are not allowed');
  });

  // Test when email format is invalid
  it('should return 400 when email format is invalid', async () => {
    const res = await request(app)
      .post('/api/admin')
      .send({
        username: 'admin',
        email: 'admintest.com',
        password: 'securePassword',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('Invalid email format');
  });

  // Test when username is already in use
  it('should return 400 when username is already in use', async () => {
    // Create an admin user
    const existingAdmin = new User({
      username: 'admin',
      email: 'admin1@test.com',
      password: 'securePassword',
      role: 'Admin'
    });
    await existingAdmin.save();

    const res = await request(app)
      .post('/api/admin')
      .send({
        username: 'admin',
        email: 'admin2@test.com',
        password: 'securePassword',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('Username or email already in use');
  });

  // Test when email is already in use
  it('should return 400 when email is already in use', async () => {
    // Create an admin user
    const existingAdmin = new User({
      username: 'admin1',
      email: 'admin@test.com',
      password: 'securePassword',
      role: 'Admin'
    });
    await existingAdmin.save();

    const res = await request(app)
      .post('/api/admin')
      .send({
        username: 'admin2',
        email: 'admin@test.com',
        password: 'securePassword',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('Username or email already in use');
  });
  test('should return 500 if database operation fails', async () => {
    const mockUser = {
      username: "admin",
      email: "admin@email.com",
      password: "securePass"
    };

    // Mock the findOne method to throw an error
    User.findOne = jest.fn(() => {
      throw new Error('Test error');
    });

    await request(app)
      .post('/api/admin')
      .send(mockUser)
      .expect(500)
      .then((response) => {
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toEqual('Test error');
      });
  });
});


describe('POST /api/login', () => {
  
  // Test for missing parameters
  it('should return 400 if email or password are missing', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: "mario.red@email.com" });
    expect(res.statusCode).toEqual(400);
  });

  // Test for empty string parameters
  it('should return 400 if email or password are empty strings', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: "", password: "" });
    expect(res.statusCode).toEqual(400);
  });

  // Test for invalid email format
  it('should return 400 if email is not in a valid format', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: "invalid.email", password: "securePass" });
    expect(res.statusCode).toEqual(400);
  });

  // Test for non-existing user
  it('should return 400 if the user does not exist', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: "non.existing@email.com", password: "securePass" });
    expect(res.statusCode).toEqual(400);
  });

  // Test for wrong password
  it('should return 400 if the supplied password does not match with the one in the database', async () => {
    // Add a user to the database
    const hashedPassword = await bcrypt.hash("securePass", 12);
    await User.create({ username: "Mario", email: "mario.red@email.com", password: hashedPassword });

    const res = await request(app)
      .post('/api/login')
      .send({ email: "mario.red@email.com", password: "wrongPassword" });
    expect(res.statusCode).toEqual(400);
  });

  // Test for successful user login
  it('should return 200 and create an accessToken and refreshToken', async () => {
    // Add a user to the database
    const hashedPassword = await bcrypt.hash("securePass", 12);
    await User.create({ username: "Mario", email: "mario.red@email.com", password: hashedPassword });

    const res = await request(app)
      .post('/api/login')
      .send({ email: "mario.red@email.com", password: "securePass" });
    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toHaveProperty("accessToken");
    expect(res.body.data).toHaveProperty("refreshToken");
  });
});


describe('POST /api/logout', () => {
  // Test for missing refresh token
  it('should return 400 if no refresh token is provided', async () => {
    const res = await request(app)
      .post('/api/logout')
    expect(res.statusCode).toEqual(400);
  });

  // Test for non-existing user
  it('should return 400 if refresh token does not represent a user in the database', async () => {
    // Set an invalid refreshToken
    const res = await request(app)
      .post('/api/logout')
      .set('Cookie', ['refreshToken=invalidToken'])
    expect(res.statusCode).toEqual(400);
  });

  // Test for successful user logout
  it('should return 200 and confirm user was logged out successfully', async () => {
    // Add a user to the database with a refresh token
    const refreshToken = jwt.sign({ id: "testId" }, process.env.REFRESH_KEY, { expiresIn: '7d' })
    await User.create({ username: "Mario", email: "mario.red@email.com", password: "securePass", refreshToken: refreshToken });

    const res = await request(app)
      .post('/api/logout')
      .set('Cookie', [`refreshToken=${refreshToken}`])
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.message).toEqual("User logged out");
  });
});



