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
  // Test Case 1: Only Admins should be able to retrieve all users
  test("should fail to retrieve all users if the user is not an admin", (done) => {
    User.create({
      username: "tester",
      email: "tester@test.com",
      password: "tester",
      refreshToken: testerAccessTokenValid,
    }).then(() => {
      request(app)
        .get("/api/users")
        .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
        .then((response) => {
          expect(response.status).toBe(401)
          expect(response.body).toHaveProperty('error')
          done()
        })
        .catch((err) => done(err))
    })
  })

  test("should retrieve list of all users if the user is an admin", (done) => {
    User.create([
      {
        username: "tester",
        email: "tester@test.com",
        password: "tester",
        refreshToken: testerAccessTokenValid,
      },
      {
        username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"
      }
    ]).then(() => {
      request(app)
        .get("/api/users")
        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
        .then((response) => {
          expect(response.status).toBe(200)
          expect(response.body.data).toHaveLength(2)
          expect(response.body.data).toContainEqual(
            expect.objectContaining({
              username: "tester",
              email: "tester@test.com",
              role: "Regular"
            })
          );
          expect(response.body.data).toContainEqual(
            expect.objectContaining({
              username: "admin",
              email: "admin@email.com",
              role: "Admin"
            })
          );
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
  })

  // Test Case 3: Unauthorized requests should not be able to retrieve all users
  test("should fail to retrieve all users if the request is unauthorized", (done) => {
    request(app)
      .get("/api/users")
      .then((response) => {
        expect(response.status).toBe(401)
        expect(response.body).toHaveProperty('error')
        done()
      })
      .catch((err) => done(err))
  })
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

describe('POST /api/groups', () => {
  
  // Test Case 1: Successfully create a group
  it('should successfully create a new group', async () => {
    await User.insertMany([{
      username: "tester",
      email: "tester@test.com",
      password: "tester",
      refreshToken: testerAccessTokenValid
    }, {
      username: "new",
      email: "new@email.com",
      password: "new",
      refreshToken: newAccessTokenValid,
    }])

    const groupData = { 
      name: "Test Group", 
      memberEmails: ["new@email.com"]
    };

    const res = await request(app)
      .post('/api/groups')
      .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
      .send(groupData);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('group');
    expect(res.body.data.group).toHaveProperty('name', 'Test Group');
    expect(res.body.data.group.members).toContain("tester@test.com");
    expect(res.body.data.group.members).toContain("new@email.com");
  });

  // Test Case 2: Failure due to incomplete request body
  it('should fail to create a group due to incomplete request body', async () => {
    const groupData = { 
      name: "Test Group"
    };

    const res = await request(app)
      .post('/api/groups')
      .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
      .send(groupData);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Incomplete request body');
  });

  // Test Case 3: Failure due to group name already exists
  it('should fail to create a group due to group name already exists', async () => {
    const groupData = { 
      name: "Test Group", 
      memberEmails: ["new@email.com"]
    };

    await request(app)
      .post('/api/groups')
      .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
      .send(groupData);

    const res = await request(app)
      .post('/api/groups')
      .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
      .send(groupData);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'A group with the same name already exists.');
  });
  // Test Case 4: Should not be able to create a group if the user is already part of another group
  it('should fail to create a group because the user is already a member of another group', async () => {
    // Create a group with user first
    const initialGroupData = { 
      name: "Initial Group", 
      memberEmails: [tester.email]
    };
    await request(app)
      .post('/api/groups')
      .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
      .send(initialGroupData);

    // Try to create another group with the same user
    const newGroupData = { 
      name: "New Group", 
      memberEmails: [tester.email]
    };
    const response = await request(app)
      .post('/api/groups')
      .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
      .send(newGroupData);

    // Check if the server responds with the correct error message and status code
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error', 'User is already a member of another group');
  });
  // Test Case 5: Failure due to an invited user already in a group
  it('should fail to create a group due to an invited user already in a group', async () => {
    const groupData1 = { 
      name: "Test Group", 
      memberEmails: ["new@email.com"]
    };
    await request(app)
      .post('/api/groups')
      .set("Cookie", `accessToken=${newAccessTokenValid}; refreshToken=${newAccessTokenValid}`) //Setting cookies in the request
      .send(groupData1);

    const groupData2 = { 
      name: "Test Group 2", 
      memberEmails: ["new@email.com"]
    };

    const res = await request(app)
      .post('/api/groups')
      .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
      .send(groupData2);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'One or more invited members are already in a group');
  });
});
describe("getGroups", () => { })

describe("getGroup", () => { })

describe("addToGroup", () => { })

describe("removeFromGroup", () => { })

describe('DELETE /users', () => {
  // Test Case 1: Successfully delete a user
  it('should successfully delete a user', async () => {
    // Create a user for testing
    await User.create({
      username: "testUser",
      email: "testUser@test.com",
      password: "testUser",
      refreshToken: newAccessTokenValid,
    });

    // Create an admin for testing
    await User.create({
      username: "adminUser",
      email: "adminUser@admin.com",
      password: "adminUser",
      refreshToken: adminAccessTokenValid,
      role: "Admin"
    });

    const res = await request(app)
      .delete('/api/users')
      .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
      .send({ email: "testUser@test.com" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('deletedTransactions', 0);
    expect(res.body.data).toHaveProperty('deletedFromGroup', false);
  });

  // Test Case 2: Deleting a user which does not exist
  it('should return error when deleting a user which does not exist', async () => {
    const res = await request(app)
      .delete('/api/users')
      .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
      .send({ email: "nonExistingUser@test.com" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'User does not exist');
  });

  // Test Case 3: Unauthorized delete of user
  it('should return error when deleting user without being authorized', async () => {
    // Create a user for testing
    await User.create({
      username: "testUser",
      email: "testUser@test.com",
      password: "testUser",
      refreshToken: newAccessTokenValid,
    });

    const res = await request(app)
      .delete('/api/users')
      .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
      .send({ email: "testUser@test.com" });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  // Test Case 4: Deleting an admin user
  it('should return error when deleting an admin user', async () => {
    // Create an admin for testing
    await User.create({
      username: "adminUser",
      email: "adminUser@admin.com",
      password: "adminUser",
      refreshToken: adminAccessTokenValid,
      role: "Admin"
    });

    const res = await request(app)
      .delete('/api/users')
      .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
      .send({ email: "adminUser@admin.com" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'You cannot delete an Admin');
  });
});


describe("deleteGroup", () => { })
