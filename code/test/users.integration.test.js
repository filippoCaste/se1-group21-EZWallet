import request from 'supertest';
import { app } from '../app';
import { User, Group } from '../models/User.js';
import { transactions, categories } from '../models/model';
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

/**
 * Necessary setup in order to create a new database for testing purposes before starting the execution of test cases.
 * Each test suite has its own database in order to avoid different tests accessing the same database at the same time and expecting different data.
 */
dotenv.config();

const adminAccessTokenValid = jwt.sign({
  email: "admin@email.com",
  //id: existingUser.id, The id field is not required in any check, so it can be omitted
  username: "admin",
  role: "Admin"
}, process.env.ACCESS_KEY, { expiresIn: '1y' })

const testerAccessTokenValid = jwt.sign({
  email: "tester@test.com",
  username: "tester",
  role: "Regular"
}, process.env.ACCESS_KEY, { expiresIn: '1y' })

const newAccessTokenValid = jwt.sign({
  email: "new@email.com",
  username: "new",
  role: "Regular"
}, process.env.ACCESS_KEY, { expiresIn: '1y' })

//These tokens can be used in order to test the specific authentication error scenarios inside verifyAuth (no need to have multiple authentication error tests for the same route)
const testerAccessTokenExpired = jwt.sign({
  email: "tester@test.com",
  username: "tester",
  role: "Regular"
}, process.env.ACCESS_KEY, { expiresIn: '0s' })

beforeAll(async () => {
  const dbName = "testingDatabaseUsers";
  const url = `${process.env.MONGO_URI}/${dbName}`;

  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

});

/**
 * After all test cases have been executed the database is deleted.
 * This is done so that subsequent executions of the test suite start with an empty database.
 */
afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});
/**
 * Database is cleared before each test case, in order to allow insertion of data tailored for each specific test case.
 */
beforeEach(async () => {
  await User.deleteMany({})
})

describe("getUsers", () => {
  test("should return empty list if there are no users", (done) => {
    request(app)
      .get("/api/users")
      .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
      .then((response) => {
        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(0)
        done()
      })
      .catch((err) => done(err))
  })

  test("should retrieve list of all users", (done) => {
    User.create({
      username: "tester",
      email: "test@test.com",
      password: "tester",
    }).then(() => {
      request(app)
        .get("/api/users")
        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
        .then((response) => {
          expect(response.status).toBe(200)
          expect(response.body.data).toHaveLength(1)
          expect(response.body.data[0].username).toEqual("tester")
          expect(response.body.data[0].email).toEqual("test@test.com")
          expect(response.body.data[0].role).toEqual("Regular")
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
  })
})
/*
describe("getUser", () => {

  test("should return user if exists", async () => {
    const newUser = new User({
      username: "tester",
      email: "test@test.com",
      password: "tester",
      role: "Admin",
    });
    await newUser.save();

    const response = await request(app)
      .get(`/api/users/${newUser.username}`)
      .set('Authorization', `Bearer ${newUser.refreshToken}`); // assuming jwt based auth

    expect(response.status).toBe(200);
    expect(response.body.data.username).toEqual(newUser.username);
    expect(response.body.data.email).toEqual(newUser.email);
    expect(response.body.data.role).toEqual(newUser.role);
  });


  test("should return 400 error if user does not exist", (done) => {
    request(app)
      .get("/api/users/nonexistentUser")
      .set('Authorization', 'Bearer dummytoken') // assuming jwt based auth
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.error).toEqual("User not found");
        done();
      })
      .catch((err) => done(err));
  });

  test("should return 401 error if user is not authorized", async (done) => {
    const newUser = new User({
      username: "tester",
      email: "test@test.com",
      password: "tester",
      role: "Regular",
    });
    await newUser.save();

    request(app)
      .get(`/api/users/${newUser.username}`)
      .set('Authorization', 'Bearer dummytoken') // assuming jwt based auth
      .then((response) => {
        expect(response.status).toBe(401);
        done();
      })
      .catch((err) => done(err));
  });
});*/



describe('GET /users/:username', () => {

  // Test Case 1: Successful retrieval of user information
  it('should successfully retrieve user information', async () => {
    await User.insertMany([{
      username: "tester",
      email: "tester@test.com",
      password: "tester",
      refreshToken: testerAccessTokenValid
    }, {
      username: "admin",
      email: "admin@email.com",
      password: "admin",
      refreshToken: adminAccessTokenValid,
      role: "Admin"
    }])

    const res = await request(app)
      .get('/api/users/tester')
      .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('username', 'tester');
    expect(res.body.data).toHaveProperty('email', 'tester@test.com');
    expect(res.body.data).toHaveProperty('role', 'Regular');
  });


  // Test Case 2: Failure due to user not found
  it('should fail to retrieve user information due to user not found', async () => {
    const res = await request(app)
      .get('/api/users/NonExistingUser')
      .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'User not found');
  });

  // Test Case 3: Failure due to unauthorized access (user is not the same as the requested user and not an admin)
  it('should fail to retrieve user information due to unauthorized access', async () => {
    // Create a user for testing
    await request(app)
      .post('/api/register')
      .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
      .send({ username: "Mario", email: "mario.red@email.com", password: "securePass" });

    const res = await request(app)
      .get('/api/users/Mario')
      .set('Authorization', 'Bearer invalidToken');

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('error');
  });

  // Test Case 4: Failure due to unauthorized access (user is not the same as the requested user and not an admin)
  it('should fail to retrieve user information due to unauthorized access (admin)', async () => {

    const res = await request(app)
      .get('/api/users/Mario')
      .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
      .set('Authorization', 'Bearer adminToken');

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('error');
  });
});



describe("createGroup", () => { })

describe("getGroups", () => { })

describe("getGroup", () => { })

describe("addToGroup", () => { })

describe("removeFromGroup", () => { })

describe("deleteUser", () => { })

describe("deleteGroup", () => { })
