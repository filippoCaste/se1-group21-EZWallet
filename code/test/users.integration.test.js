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
 
describe('getUser', () => {

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

describe('createGroup', () => {
 
  // Test Case 1: Successfully create a group
  it('should successfully create a new group', async () => {
    await User.insertMany([
      {
        username: "tester",
        email: "tester@test.com",
        password: "tester",
        refreshToken: testerAccessTokenValid,
      },
      {
        username: "new",
        email: "new@email.com",
        password: "new",
        refreshToken: newAccessTokenValid,
      },
    ]);

    const groupData = {
      name: "Test Group",
      memberEmails: ["new@email.com"],
    };

    const res = await request(app)
      .post('/api/groups')
      .set(
        "Cookie",
        `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`
      )
      .send(groupData);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('group');
    expect(res.body.data.group).toHaveProperty('name', 'Test Group');
    expect(res.body.data.group.members[1].email).toBe("tester@test.com");
    expect(res.body.data.group.members).toHaveLength(2);
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
    await User.insertMany([
      {
        username: "tester",
        email: "tester@test.com",
        password: "tester",
        refreshToken: testerAccessTokenValid,
      },
      {
        username: "new",
        email: "new@email.com",
        password: "new",
        refreshToken: newAccessTokenValid,
      },
    ]);
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
    await User.insertMany([
      {
        username: "tester",
        email: "tester@test.com",
        password: "tester",
        refreshToken: testerAccessTokenValid,
      },
      {
        username: "new",
        email: "new@email.com",
        password: "new",
        refreshToken: newAccessTokenValid,
      },
    ]);
    // Create a group with user first
    const initialGroupData = { 
      name: "Initial Group", 
      memberEmails: ["tester@test.com"]
    };
  
    // Try to create another group with the same user
    const newGroupData = { 
      name: "New Group", 
      memberEmails: ["tester@test.com"]
    };
    const response = await request(app)
      .post('/api/groups')
      .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
      .send(newGroupData);

    // Check if the server responds with the correct error message and status code
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error', 'You are already in a Group');
  });
  
});

describe("getGroups", () => {
  beforeEach(async () => {
    await Group.deleteMany({})
  })
  
  // Test Case 1: Successful retrieval of groups by an admin
  it('should return an array of groups', async () => {
    // Create some test groups
    await Group.insertMany([
      { name: "Group1", members: [{email: "mario.red@email.com"}, {email: "luigi.red@email.com"}] },
      { name: "Group2", members: [{email: "peach.pink@email.com"}, {email: "toad.blue@email.com"}] },
    ]);

    const res = await request(app)
      .get('/api/groups')
      .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveLength(2);

    expect(res.body.data[0]).toHaveProperty('name', 'Group1');
    expect(res.body.data[0].members).toEqual([{email: 'mario.red@email.com'}, {email: 'luigi.red@email.com'}]);
    expect(res.body.data[1]).toHaveProperty('name', 'Group2');
    expect(res.body.data[1].members).toEqual([{email: 'peach.pink@email.com'}, {email: 'toad.blue@email.com'}]);
  });

  // Test Case 2: Failure due to unauthenticated user
  it('should fail to retrieve groups due to unauthorized access', async () => {
    const res = await request(app)
      .get('/api/groups')
      .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('error');
  });

  // Test Case 3: Successful retrieval of an empty array if no groups
  it('should return an empty array if no groups exist', async () => {
    const res = await request(app)
      .get('/api/groups')
      .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveLength(0);
  });

  // Test Case 4: Failure due to expired access token
  it('should fail to retrieve groups due to expired access token', async () => {
    const res = await request(app)
      .get('/api/groups')
      .set("Cookie", `accessToken=${testerAccessTokenExpired}; refreshToken=${testerAccessTokenExpired}`) //Setting cookies in the request

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('error');
  });
});

describe('getGroup', () => {
  
  // Test Case 1: Successful retrieval of group information
  it('should successfully retrieve group information by group name', async () => {
    
    // Create users and a group for testing
    const users = await User.insertMany([{
      username: "admin",
      email: "admin@email.com",
      password: "admin",
      refreshToken: adminAccessTokenValid,
      role: "Admin"
    }, {
      username: "tester",
      email: "tester@test.com",
      password: "tester",
      refreshToken: testerAccessTokenValid
    }, {
      username: "new",
      email: "new@email.com",
      password: "new",
      refreshToken: newAccessTokenValid
    }])

    await Group.create({
      name: "Family",
      members: [
        {
          email: "admin@email.com",
          user: users[0]._id
        },
        {
          email: "tester@test.com",
          user: users[1]._id
        },
        {
          email: "new@email.com",
          user: users[2]._id
        }
      ]
    });

    const res = await request(app)
      .get('/api/groups/Family')
      .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('name', 'Family');
    expect(res.body.data).toHaveProperty('members');
    expect(res.body.data.members).toHaveLength(3);
  });

  // Test Case 2: Failure due to group not found
  it('should fail to retrieve group information due to group not found', async () => {
    const res = await request(app)
      .get('/api/groups/NonExistingGroup')
      .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'The group does not exist');
  });

  // Test Case 3: Failure due to unauthorized access (user is not a member of the group and not an admin)
  it('should fail to retrieve group information due to unauthorized access', async () => {
    const res = await request(app)
      .get('/api/groups/Family')
      .set("Cookie", `accessToken=${testerAccessTokenExpired}; refreshToken=${testerAccessTokenExpired}`) //Setting cookies in the request

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('error');
  });
});

describe("addToGroup", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});
    User.create({
      username: "tester",
      email: "tester@test.com",
      password: "tester",
      refreshToken: testerAccessTokenValid,
    });
  });
  // Test Case 1: Successful addition of a new member to the group
  it("should successfully add a new member to the group", async () => {
    // Create a group
    const groupName = "Family"
    await Group.create({ name: groupName, members: [{ email: "mario.red@email.com," }, {email: "tester@test.com"}] });
    User.create({
      username: "pietro",
      email: "pietro.blue@email.com",
      password: "mockpsw",
      refreshToken: "mock",
    })
    // Prepare the request body
    const reqBody = {
      emails: ["pietro.blue@email.com"]
    };

    const res = await request(app)
      .patch(`/api/groups/${groupName}/add`)
      .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
      .send(reqBody);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('group');
    expect(res.body.data.group).toHaveProperty('name', 'Family');
    expect(res.body.data.group.members).toContainEqual({email: "pietro.blue@email.com"});
    expect(res.body.data.membersNotFound).toHaveLength(0);
    expect(res.body.data.alreadyInGroup).toHaveLength(0);
  });

  // Test Case 2: Failure due to group not found
  it("should fail to add members due to group not found", async () => {
    const groupName = "Family"
    // Prepare the request body
    const reqBody = {
      emails: ["pietro.blue@email.com"]
    };

    const res = await request(app)
    .patch(`/api/groups/${groupName}/add`)
      .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
      .send(reqBody);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'There is no Group with this name');
  });

  // Test Case 3: Failure due to incomplete request body
  it("should fail to add members due to incomplete request body", async () => {
    // Create a group
    await Group.create({ name: "Family", members: [{ email: "mario.red@email.com" }] });

    // Prepare the request body
    const reqBody = {};

    const res = await request(app)
      .patch(`/api/groups/Family/add`)
      .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
      .send(reqBody);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Incomplete request body');
  });

  // Test Case 4: Failure due to invalid email format
  it("should fail to add members due to invalid email format", async () => {
    // Create a group
    await Group.create({ name: "Family", members: [{ email: "mario.red@email.com" },{email: "tester@test.com"}] });

    // Prepare the request body
    const reqBody = {
      emails: ["invalidEmail"]
    };

    const res = await request(app)
      .patch(`/api/groups/Family/add`)
      .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
      .send(reqBody);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid memberEmail format');
  });

    // Test Case 5: Failure due to user not being a group member
    it("should fail to add members because the current user is not a member of the group", async () => {
      // Create a group
      await Group.create({ name: "Friends", members: [{ email: "mario.red@email.com" }] });
  
      // Prepare the request body
      const reqBody = {
        emails: ["pietro.blue@email.com"]
      };
  
      const res = await request(app)
        .patch(`/api/groups/Friends/add`)
        .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies with unauthorized user in the request
        .send(reqBody);
  
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Unauthorized');
    });
  
    // Test Case 6: Adding an existing member to the group
    it("should fail adding only one member that is already in another group", async () => {
      // Create a group
      await Group.create({ name: "Family", members: [{ email: "pietro.blue@email.com" },{email: "tester@test.com"}] });
      User.create({
        username: "pietro",
        email: "pietro.blue@email.com",
        password: "mockpsw",
        refreshToken: "mock",
      })
      // Prepare the request body
      const reqBody = {
        emails: ["pietro.blue@email.com"]
      };
  
      const res = await request(app)
        .patch(`/api/groups/Family/add`)
        .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
        .send(reqBody);
  
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error','Member emails either do not exist or are already in a group');
      
    });
  
    // Test Case 7: Adding a non-existing member to the group
    it("should not add a non-existing member to the group", async () => {
      // Create a group
      await Group.create({ name: "Family", members: [{ email: "mario.red@email.com" },{email: "tester@test.com"}] });
  
      const reqBody = {
        emails: ["pietro.blue@email.com"]
      };
  
      const res = await request(app)
        .patch(`/api/groups/Family/add`)
        .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
        .send(reqBody);
  
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error','Member emails either do not exist or are already in a group');
    });
});

describe('removeFromGroup', () => {
  beforeEach(async () => {
    await Group.deleteMany({});
  });
  // Test Case 1: Successful removal of user from group
  it('should successfully remove user from group', async () => {
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

    await Group.create({
      name: "Family",
      members: [{
        username: "tester",
        email: "tester@test.com"
      }, {
        username: "admin",
        email: "admin@email.com"
      }]
    });

    const res = await request(app)
      .patch('/api/groups/Family/remove')
      .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
      .send({ emails: ["tester@test.com"] });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data.group.members).toHaveLength(1);
    expect(res.body.data.group.members[0].email).toEqual('admin@email.com');
    expect(res.body.data.notInGroup).toHaveLength(0);
    expect(res.body.data.membersNotFound).toHaveLength(0);
  });

  // Test Case 2: Failure due to group not found
  it('should fail to remove user from group due to group not found', async () => {
    await Group.create({
      name: "Family",
      members: [{
        username: "tester",
        email: "tester@test.com"
      }, {
        username: "admin",
        email: "admin@email.com"
      }]
    });

    const res = await request(app)
      .patch('/api/groups/NonExistingGroup/remove')
      .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
      .send({ emails: ["admin@email.com"] });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'There is no Group with this name');
  });

  // Test Case 3: Failure due to incomplete request body
  it('should fail to remove user from group due to incomplete request body', async () => {
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

    await Group.create({
      name: "Family",
      members: [{
        username: "tester",
        email: "tester@test.com"
      }, {
        username: "admin",
        email: "admin@email.com"
      }]
    });

    const res = await request(app)
      .patch('/api/groups/Family/remove')
      .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
      .send({});

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Incomplete request body');
  });

  // Test Case 4: Failure due to unauthorized access
  it('should fail to remove user from group due to unauthorized access', async () => {
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

    await Group.create({
      name: "Family",
      members: [{
        username: "tester",
        email: "tester@test.com"
      }, {
        username: "admin",
        email: "admin@email.com"
      }]
    });

    const res = await request(app)
      .patch('/api/groups/Family/remove')
      .set("Cookie", `accessToken=${newAccessTokenValid}; refreshToken=${newAccessTokenValid}`) //Setting cookies in the request
      .send({ emails: ["admin@email.com"] });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('error');
  });

  // Test Case 5: Failure due to invalid email format
  it('should fail to remove user from group due to invalid email format', async () => {
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

    await Group.create({
      name: "Family",
      members: [{
        username: "tester",
        email: "tester@test.com"
      }, {
        username: "admin",
        email: "admin@email.com"
      }]
    });

    const res = await request(app)
      .patch('/api/groups/Family/remove')
      .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
      .send({ emails: ["invalidEmail"] });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Invalid memberEmail format');
  });
    // Test Case 6: Failure due to last member of the group
    it('should fail to remove the last user from the group', async () => {
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

      await Group.create({
        name: "Solo",
        members: [{
          username: "tester",
          email: "tester@test.com"
        }]
      });
  
      const res = await request(app)
        .patch('/api/groups/Solo/remove')
        .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
        .send({ emails: ["tester@test.com"] });
  
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'You cannot remove the last member of the group!');
    });
  
    // Test Case 7: Failure due to member not found in group
    it('should fail to remove a member that is not part of the group', async () => {
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

      await Group.create({
        name: "Family",
        members: [{
          username: "tester",
          email: "tester@test.com"
        }, {
          username: "admin",
          email: "admin@email.com"
        }]
      });

      const res = await request(app)
        .patch('/api/groups/Family/remove')
        .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
        .send({ emails: ["stranger@email.com"] });
  
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Member emails either do not exist or are not in the group');
    });
  
    // Test Case 8: Failure due to non-existent member
    it('should fail to remove a member that does not exist', async () => {
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

      await Group.create({
        name: "Family",
        members: [{
          username: "tester",
          email: "tester@test.com"
        }, {
          username: "admin",
          email: "admin@email.com"
        }]
      });

      const res = await request(app)
        .patch('/api/groups/Family/remove')
        .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
        .send({ emails: ["nonexistent@email.com"] });
  
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Member emails either do not exist or are not in the group');
    });
});

describe('deleteUser', () => {
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

describe('deleteGroup', () => {
  beforeEach(async () => {
    await Group.deleteMany({});
  });
  // Test Case 1: Successfully delete a group
  it('should delete a group successfully', async () => {
    await Group.create({
      name: "Family",
      members: []
    });

    const res = await request(app)
      .delete('/api/groups')
      .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
      .send({ name: "Family" })

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('message', 'Group deleted successfully');
  });

  // Test Case 2: Failure due to group not found
  it('should fail to delete a group due to group not found', async () => {
    const res = await request(app)
      .delete('/api/groups')
      .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
      .send({ name: "NonExistingGroup" })

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Group does not exist');
  });

  // Test Case 3: Failure due to incomplete request body
  it('should fail to delete a group due to incomplete request body', async () => {
    const res = await request(app)
      .delete('/api/groups')
      .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
      .send({ })

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Incomplete request body');
  });

  // Test Case 4: Failure due to empty group name
  it('should fail to delete a group due to empty group name', async () => {
    const res = await request(app)
      .delete('/api/groups')
      .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
      .send({ name: "" })

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Empty fields are not allowed');
  });

  // Test Case 5: Failure due to unauthorized access
  it('should fail to delete a group due to unauthorized access', async () => {
    const res = await request(app)
      .delete('/api/groups')
      .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
      .send({ name: "Family" })

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('error');
  });

  // Test Case 6: Failure due to expired token
  it('should fail to delete a group due to expired token', async () => {
    const res = await request(app)
      .delete('/api/groups')
      .set("Cookie", `accessToken=${testerAccessTokenExpired}; refreshToken=${testerAccessTokenExpired}`) //Setting cookies in the request
      .send({ name: "Family" })

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('error');
  });
});
 /**/

