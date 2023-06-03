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



describe('login', () => {
  // Test if all necessary parameters are supplied
  it('should return 400 error if request body is missing required parameters', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ email: 'test@mail.com' }); // password is missing
    expect(response.status).toBe(400);
  });

  // Test if parameters are empty strings
  it('should return 400 error if any parameter is an empty string', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ email: 'test@mail.com', password: '' }); // password is empty string
    expect(response.status).toBe(400);
  });

  // Test if email is in correct format
  it('should return 400 error if email is in invalid format', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ email: 'invalidEmail', password: 'pass' }); // invalid email format
    expect(response.status).toBe(400);
  });

  // Test if email does not exist in the database
  it('should return 400 error if email does not exist in the database', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ email: 'nonexistent@mail.com', password: 'pass' }); // nonexistent email
    expect(response.status).toBe(400);
  });

  // Test if supplied password does not match the one in the database
  it('should return 400 error if supplied password does not match with the one in the database', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ email: 'test@mail.com', password: 'wrongPass' }); // incorrect password
    expect(response.status).toBe(400);
  });

  // Test if login is successful with correct email and password
  it('should return accessToken and refreshToken with successful login', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ email: 'test@mail.com', password: 'pass' }); // correct email and password
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('accessToken');
    expect(response.body.data).toHaveProperty('refreshToken');
  });
});


describe('logout', () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
        //delete the created accessToken and refreshToken from DB
        // A message confirming successful logout
        //display logIn screen
    });
});


