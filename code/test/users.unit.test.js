import request from 'supertest';
import { app } from '../app';
import { Group, User } from '../models/User.js';
import { verifyAuth } from '../controllers/utils';
import { createGroup, getUser, getUsers } from '../controllers/users';

/**
 * In order to correctly mock the calls to external modules it is necessary to mock them using the following line.
 * Without this operation, it is not possible to replace the actual implementation of the external functions with the one
 * needed for the test cases.
 * `jest.mock()` must be called for every external module that is called in the functions under test.
 */
jest.mock('../models/User.js');
jest.mock('../controllers/utils.js');
jest.mock('../models/model.js');

/**
 * Defines code to be executed before each test case is launched
 * In this case the mock implementation of `User.find()` is cleared, allowing the definition of a new mock implementation.
 * Not doing this `mockClear()` means that test cases may use a mock implementation intended for other test cases.
 */


describe("getUsers", () => {
  let testReq;
  let testRes;
  let statusSpy;
  let jsonSpy;
  let findSpy;

  beforeEach(() => {
    statusSpy = jest.fn().mockReturnThis();
    jsonSpy = jest.fn();
    findSpy = jest.spyOn(User, 'find');

    testReq = {};
    testRes = {
      status: statusSpy,
      json: jsonSpy,
      locals: {
        refreshedTokenMessage: "Token message"
      }
    };

    verifyAuth.mockReturnValue({ authorized: true, authType: "Admin" });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Should return an array of users when called by an authenticated admin", async () => {
    const expectedUsers = [
      { username: "Mario", email: "mario.red@email.com", role: "Regular" },
      { username: "Luigi", email: "luigi.red@email.com", role: "Regular" },
      { username: "admin", email: "admin@email.com", role: "Regular" }
    ];
    findSpy.mockResolvedValue(expectedUsers);
    await getUsers(testReq, testRes);
    expect(statusSpy).toHaveBeenCalledWith(200);
    expect(jsonSpy).toHaveBeenCalledWith({
      data: expectedUsers,
      refreshedTokenMessage: testRes.locals.refreshedTokenMessage
    });
  });

  test("Should return 401 if called by an authenticated user who is not an admin", async () => {
    verifyAuth.mockReturnValue({ authorized: false, cause: "Unauthorized" });
    await getUsers(testReq, testRes);
    expect(statusSpy).toHaveBeenCalledWith(401);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "Unauthorized" });
  });

  test("Should return 500 if there is a Server Error", async () => {
    findSpy.mockRejectedValue(new Error('Server error'));
    await getUsers(testReq, testRes);
    expect(statusSpy).toHaveBeenCalledWith(500);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "Server error" });
  });
});


describe("getUser", () => {
  let testReq;
  let testRes;
  let statusSpy;
  let jsonSpy;
  let findSpy;

  beforeEach(() => {
    statusSpy = jest.fn().mockReturnThis();
    jsonSpy = jest.fn();
    findSpy = jest.spyOn(User, 'findOne');

    testReq = {
      params: {
        username: "testuser"
      }
    };
    testRes = {
      status: statusSpy,
      json: jsonSpy,
      locals: {
        refreshedTokenMessage: "Token message"
      }
    };
    verifyAuth.mockReturnValue({ authorized: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Should return user data when called by an authenticated user", async () => {
    const expectedUser = {
      username: "testuser",
      email: "testuser@example.com",
      role: "Regular"
    };
    findSpy.mockResolvedValue(expectedUser);
    await getUser(testReq, testRes);
    expect(statusSpy).toHaveBeenCalledWith(200);
    expect(jsonSpy).toHaveBeenCalledWith({
      data: expectedUser,
      refreshedTokenMessage: testRes.locals.refreshedTokenMessage
    });
  });

  test("Should return user not found error if user does not exist", async () => {
    findSpy.mockResolvedValue(null);
    await getUser(testReq, testRes);
    expect(statusSpy).toHaveBeenCalledWith(400);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "User not found" });
  });

  test("Should return user data when called by an authenticated admin", async () => {
    const expectedUser = {
      username: "testuser",
      email: "testuser@example.com",
      role: "Regular"
    };
    findSpy.mockResolvedValue(expectedUser);
    await getUser(testReq, testRes);
    expect(statusSpy).toHaveBeenCalledWith(200);
    expect(jsonSpy).toHaveBeenCalledWith({
      data: expectedUser,
      refreshedTokenMessage: testRes.locals.refreshedTokenMessage
    });
  });

  test("Should return unauthorized error if both user and admin auth fail", async () => {
    verifyAuth.mockReturnValue({ authorized: false, cause: "Unauthorized" });
    await getUser(testReq, testRes);
    expect(statusSpy).toHaveBeenCalledWith(401);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "Unauthorized" });

  });

  test("Should return 500 if there is a Server Error", async () => {
    findSpy.mockRejectedValue(new Error('Server error'));
    await getUser(testReq, testRes);
    expect(statusSpy).toHaveBeenCalledWith(500);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "Server error" });

  });
});


describe("createGroup", () => {
  let testReq;
  let testRes;
  let statusSpy;
  let jsonSpy;
  beforeEach(() => {
    testReq = {
      body: {
        name: "testGroup",
        memberEmails: ["userTest1@test.ut", "userTest2@test.ut"]
      },
      cookies: {
        refreshToken: "aValidToken"
      }
    }
    statusSpy = jest.fn().mockReturnThis();
    jsonSpy = jest.fn();
    testRes = {
      status: statusSpy,
      json: jsonSpy,
      locals: {
        refreshedTokenMessage: "Token message"
      }

    };
    verifyAuth.mockReturnValueOnce({ authorized: true });

  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Should successfully create a Group", async () => {
    User.findOne.mockResolvedValueOnce({ email: "userTest1@test.ut" });
    Group.findOne.mockResolvedValueOnce();
    Group.exists.mockResolvedValueOnce();
    User.findOne.mockResolvedValueOnce({ username: "u1", email: "userTest1@test.ut", password: "hashpsw" });
    Group.exists.mockResolvedValueOnce();
    User.findOne.mockResolvedValueOnce({ username: "u2", email: "userTest2@test.ut", password: "hashpsw" });
    Group.exists.mockResolvedValueOnce();
    const group = {
      name: "testGroup",
      members: [{
        email:
          ["userTest1@test.ut", "userTest2@test.ut"]
      }]
    }
    Group.create.mockResolvedValueOnce(group);
    const responseData = {
      group: {
        name: group.name,
        members: group.members.map(member => member.email)
      },
      alreadyInGroup: [],
      membersNotFound: []
    }
    await createGroup(testReq, testRes);
    // expect(testRes.status).toHaveBeenCalledWith(200);
    expect(testRes.json).toHaveBeenCalledWith({ data: responseData, refreshedTokenMessage: testRes.locals.refreshedTokenMessage });
  });
});

describe("getGroups", () => { })

describe("getGroup", () => { })

describe("addToGroup", () => { })

describe("removeFromGroup", () => { })

describe("deleteUser", () => { })

describe("deleteGroup", () => { })