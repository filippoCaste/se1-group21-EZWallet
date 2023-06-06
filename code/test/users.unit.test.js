import request from 'supertest';
import { app } from '../app';
import { Group, User } from '../models/User.js';
import { verifyAuth } from '../controllers/utils';
import { createGroup, getGroups, getUser, getUsers, getGroup, addToGroup, removeFromGroup, deleteUser, deleteGroup } from '../controllers/users';

import { transactions } from '../models/model';



/**
 * In order to correctly mock the calls to external modules it is necessary to mock them using the following line.
 * Without this operation, it is not possible to replace the actual implementation of the external functions with the one
 * needed for the test cases.
 * `jest.mock()` must be called for every external module that is called in the functions under test.
 */
jest.mock('../models/User.js');
jest.mock('../models/model.js');
jest.mock('../controllers/utils.js');


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
    jest.clearAllMocks();
    testReq = {
      body: {
        name: "testGroup",
        memberEmails: ["userTest1@test.ut", "userTest2@test.ut"]
      },
      cookies: {
        refreshToken: "aValidToken"
      }
    };
    statusSpy = jest.fn().mockReturnThis();
    jsonSpy = jest.fn();
    testRes = {
      status: statusSpy,
      json: jsonSpy,
      locals: {
        refreshedTokenMessage: "Token message"
      }
    };

  });



  test("Should successfully create a Group", async () => {
    verifyAuth.mockReturnValue({ authorized: true });
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
    };
    Group.create.mockResolvedValueOnce(group);
    const responseData = {
      group: {
        name: group.name,
        members: group.members.map(member => member.email)
      },
      alreadyInGroup: [],
      membersNotFound: []
    };
    await createGroup(testReq, testRes);
    expect(testRes.status).toHaveBeenCalledWith(200);
    expect(testRes.json).toHaveBeenCalledWith({ data: responseData, refreshedTokenMessage: testRes.locals.refreshedTokenMessage });
  });

  test("Should return 401 if not authorized", async () => {
    verifyAuth.mockReturnValue({ authorized: false, cause: "Unauthorized" });
    await createGroup(testReq, testRes);
    expect(statusSpy).toHaveBeenCalledWith(401);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "Unauthorized" });
  });

  test("Should return 400 if request body is incomplete", async () => {
    verifyAuth.mockReturnValue({ authorized: true });
    testReq.body = { name: "testGroup" };
    await createGroup(testReq, testRes);
    expect(statusSpy).toHaveBeenCalledWith(400);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "Incomplete request body" });
  });

  test("Should return 400 if name field is empty", async () => {
    verifyAuth.mockReturnValue({ authorized: true });
    testReq.body.name = "";
    await createGroup(testReq, testRes);
    expect(statusSpy).toHaveBeenCalledWith(400);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "Empty fields are not allowed" });
  });

  test("Should return 400 if a group with the same name already exists", async () => {
    verifyAuth.mockReturnValue({ authorized: true });
    User.findOne.mockResolvedValueOnce({ email: "userTest1@test.ut" });
    Group.findOne.mockResolvedValueOnce(true);
    await createGroup(testReq, testRes);
    expect(statusSpy).toHaveBeenCalledWith(400);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "A group with the same name already exists." });
  });

  test("Should return 400 if the user calling the API is already in a group", async () => {
    verifyAuth.mockReturnValue({ authorized: true });
    User.findOne.mockResolvedValueOnce({ email: "userTest1@test.ut" });
    Group.findOne.mockResolvedValueOnce();
    Group.exists.mockResolvedValue(true);
    await createGroup(testReq, testRes);
    expect(statusSpy).toHaveBeenCalledWith(400);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "You are already in a Group" });
  });

  test("Should return 400 if invalid memberEmail format", async () => {
    testReq.body.memberEmails = ["userTest1@test", "userTest2@test"];
    verifyAuth.mockReturnValue({ authorized: true });
    User.findOne.mockResolvedValueOnce({ email: "userTest1@test.ut" });
    Group.findOne.mockResolvedValueOnce();
    Group.exists.mockResolvedValueOnce(false);
    await createGroup(testReq, testRes);
    expect(statusSpy).toHaveBeenCalledWith(400);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "Invalid memberEmail format" });
  });

  test("Should return 400 if all memberEmails are already in a group or do not exist in the database", async () => {
    verifyAuth.mockReturnValue({ authorized: true });
    User.findOne.mockResolvedValueOnce({ email: "userTest1@test.ut" });
    Group.findOne.mockResolvedValueOnce();
    Group.exists.mockResolvedValueOnce(false);


    User.findOne.mockResolvedValueOnce(null);
    User.findOne.mockResolvedValueOnce(true);
    Group.exists.mockResolvedValueOnce(true);
    await createGroup(testReq, testRes);
    expect(statusSpy).toHaveBeenCalledWith(400);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "All the provided emails represent users that are already in a group or do not exist in the database" });
  });

  test("Should return 500 if there is a Server Error", async () => {
    User.findOne.mockRejectedValueOnce(new Error('Server error'));
    await createGroup(testReq, testRes);
    expect(statusSpy).toHaveBeenCalledWith(500);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "Server error" });
  });

});

describe("getGroups", () => {
  let testReq;
  let testRes;
  let statusSpy;
  let jsonSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    testReq = {};
    statusSpy = jest.fn().mockReturnThis();
    jsonSpy = jest.fn();
    testRes = {
      status: statusSpy,
      json: jsonSpy,
      locals: {
        refreshedTokenMessage: "Token message"
      }
    };
  });

  test("Should successfully retrieve all groups", async () => {
    const groups = [
      {
        name: "Group 1",
        members: [{ email: "user1@test.com" }, { email: "user2@test.com" }]
      },
      {
        name: "Group 2",
        members: [{ email: "user3@test.com" }, { email: "user4@test.com" }]
      }
    ];
    Group.find.mockResolvedValueOnce(groups);

    const responseData = groups.map(group => ({
      name: group.name,
      members: group.members.map(member => member.email)
    }));

    await getGroups(testReq, testRes);

    expect(testRes.status).toHaveBeenCalledWith(200);
    expect(testRes.json).toHaveBeenCalledWith({
      data: responseData,
      refreshedTokenMessage: testRes.locals.refreshedTokenMessage
    });
  });

  test("Should return 401 if not authorized", async () => {
    const adminAuth = { authorized: false, cause: "Unauthorized" };
    verifyAuth.mockReturnValueOnce(adminAuth);

    await getGroups(testReq, testRes);

    expect(statusSpy).toHaveBeenCalledWith(401);
    expect(jsonSpy).toHaveBeenCalledWith({ error: adminAuth.cause });
  });

  test("Should return 500 if there is a Server Error", async () => {
    verifyAuth.mockReturnValueOnce({ authorized: true });
    Group.find.mockRejectedValueOnce(new Error("Server error"));

    await getGroups(testReq, testRes);

    expect(statusSpy).toHaveBeenCalledWith(500);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "Server error" });
  });
});

describe("getGroup", () => {
  let testReq;
  let testRes;
  let statusSpy;
  let jsonSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    testReq = {
      params: {
        name: "Group 1"
      }
    };
    statusSpy = jest.fn().mockReturnThis();
    jsonSpy = jest.fn();
    testRes = {
      status: statusSpy,
      json: jsonSpy,
      locals: {
        refreshedTokenMessage: "Token message"
      }
    };
  });

  test("Should successfully retrieve a group by name", async () => {
    const group = {
      name: "Group 1",
      members: [{ email: "user1@test.com" }, { email: "user2@test.com" }]
    };
    Group.findOne.mockResolvedValueOnce(group);

    verifyAuth.mockReturnValueOnce({ authorized: true });
    verifyAuth.mockReturnValueOnce({ authorized: true });

    const responseData = {
      name: group.name,
      members: group.members.map(member => member.email)
    };

    await getGroup(testReq, testRes);

    expect(testRes.status).toHaveBeenCalledWith(200);
    expect(testRes.json).toHaveBeenCalledWith({
      data: responseData,
      refreshedTokenMessage: testRes.locals.refreshedTokenMessage
    });
  });

  test("Should return 400 if the group does not exist", async () => {
    Group.findOne.mockResolvedValueOnce(null);

    await getGroup(testReq, testRes);

    expect(statusSpy).toHaveBeenCalledWith(400);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "The group does not exist" });
  });

  test("Should return 401 if not authorized as an admin or a group member", async () => {
    const group = {
      name: "Group 1",
      members: [{ email: "user1@test.com" }, { email: "user2@test.com" }]
    };
    Group.findOne.mockResolvedValueOnce(group);

    verifyAuth.mockReturnValueOnce({ authorized: false, cause: "Unauthorized" });
    verifyAuth.mockReturnValueOnce({ authorized: false, cause: "Unauthorized" });

    await getGroup(testReq, testRes);

    expect(statusSpy).toHaveBeenCalledWith(401);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "Unauthorized" });
  });

  test("Should return 500 if there is a Server Error", async () => {
    Group.findOne.mockRejectedValueOnce(new Error("Server error"));

    await getGroup(testReq, testRes);

    expect(statusSpy).toHaveBeenCalledWith(500);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "Server error" });
  });
});

describe("addToGroup", () => {
  let testReq;
  let testRes;
  let statusSpy;
  let jsonSpy;

  beforeEach(() => {
    statusSpy = jest.fn().mockReturnThis();
    jsonSpy = jest.fn();
    testReq = {
      params: { name: "testGroup" },
      body: { memberEmails: ["test2@example.com"] },
      path: "/groups/testGroup/insert"
    };
    testRes = {
      status: statusSpy,
      json: jsonSpy,
      locals: {
        refreshedTokenMessage: "Token message",
      },
    };
    verifyAuth.mockReturnValue({ authorized: true });
  });
  afterEach(() => {
    jest.clearAllMocks();
    Group.findOne.mockClear();
    Group.exists.mockClear();
    User.findOne.mockClear();
    verifyAuth.mockClear();
  });
  test("Should add members to the specified group", async () => {
    Group.findOne.mockResolvedValueOnce({ name: "testGroup", members: [{ email: "test1@example.com" }] });
    User.findOne.mockResolvedValueOnce({ email: "test2@example.com" })
    Group.exists.mockResolvedValueOnce(false);
    Group.updateOne.mockResolvedValueOnce();
    await addToGroup(testReq, testRes);
    expect(statusSpy).toHaveBeenCalledWith(200);
    expect(jsonSpy).toHaveBeenCalledWith({
      data: {
        group: {
          name: "testGroup",
          members: ["test1@example.com", "test2@example.com"]
        },
        alreadyInGroup: [],
        membersNotFound: []
      },
      refreshedTokenMessage: testRes.locals.refreshedTokenMessage
    });
  });

  test("Should return 400 if the group does not exist", async () => {
    Group.findOne.mockResolvedValueOnce();
    await addToGroup(testReq, testRes);
    expect(statusSpy).toHaveBeenCalledWith(400);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "There is no Group with this name" });
  });

  test("Should return 400 if something is missing in the request body", async () => {
    Group.findOne.mockResolvedValueOnce({});
    testReq.body = {};
    await addToGroup(testReq, testRes);
    expect(statusSpy).toHaveBeenCalledWith(400);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "Incomplete request body" });

  });

  test("Should return 400 if some of memberEmails are not in valid format", async () => {
    Group.findOne.mockResolvedValueOnce({ name: "testGroup", members: [{ email: "test1@example.com" }] });
    testReq.body.memberEmails = ["test1@example.com", "invalidEmail"];
    await addToGroup(testReq, testRes);
    expect(statusSpy).toHaveBeenCalledWith(400);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "Invalid memberEmail format" });

  });

  test("Should return 400 if all memberEmails do not exist or are already in a group", async () => {
    testReq = {
      params: { name: "testGroup" },
      body: { memberEmails: ["test2@example.com","testNotFound@example.com"] },
      path: "/groups/testGroup/insert"
    };
    
    Group.findOne.mockResolvedValueOnce({ name: "testGroup", members: [{ email: "test1@example.com" }] });
    User.findOne.mockResolvedValueOnce({ email: "test2@example.com" });
    Group.exists.mockResolvedValueOnce(true);
    User.findOne.mockResolvedValueOnce(null);
    await addToGroup(testReq, testRes);
    expect(statusSpy).toHaveBeenCalledWith(400);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "Member emails either do not exist or are already in a group" });

  });

  test("Should return 401 if not authorized as an admin or a group member", async () => {
    Group.findOne.mockResolvedValueOnce({ name: "testGroup", members: [{ email: "test1@example.com" }] });
    verifyAuth.mockReturnValueOnce({ authorized: false, cause: "Unauthorized" });
    verifyAuth.mockReturnValueOnce({ authorized: false, cause: "Unauthorized" });
    await addToGroup(testReq, testRes);
    expect(statusSpy).toHaveBeenCalledWith(401);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "Unauthorized" });

  });

  test("Should return 500 if there is a Server Error", async () => {
    Group.findOne.mockRejectedValueOnce(new Error("Database error"));
    await addToGroup(testReq, testRes);
    expect(statusSpy).toHaveBeenCalledWith(500);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "Database error" });

  });
});

describe("removeFromGroup", () => {
  let testReq;
  let testRes;
  let statusSpy;
  let jsonSpy;

  beforeEach(() => {
    statusSpy = jest.fn().mockReturnThis();
    jsonSpy = jest.fn();
    testReq = {
      params: { name: "testGroup" },
      body: { memberEmails: ["test2@example.com"] },
      path: "/groups/testGroup/remove"
    };
    testRes = {
      status: statusSpy,
      json: jsonSpy,
      locals: {
        refreshedTokenMessage: "Token message",
      },
    };
    verifyAuth.mockReturnValue({ authorized: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
    Group.findOne.mockClear();
    User.find.mockClear();
    verifyAuth.mockClear();
  });

  test("Should remove members from the specified group", async () => {
    const group = {
      name: "testGroup",
      members: [
        { email: "test1@example.com" },
        { email: "test2@example.com" }
      ]
    };
    const user1 = { email: "test1@example.com" };
    const user2 = { email: "test2@example.com" };
    Group.findOne.mockResolvedValueOnce(group);
    verifyAuth.mockReturnValueOnce({ authorized: true });
    verifyAuth.mockReturnValueOnce({ authorized: true });
    User.find.mockResolvedValueOnce([user1, user2]);
    Group.updateOne.mockResolvedValueOnce();
    await removeFromGroup(testReq, testRes);
    expect(statusSpy).toHaveBeenCalledWith(200);
    expect(jsonSpy).toHaveBeenCalledWith({
      data: {
        group: {
          name: "testGroup",
          members: ["test1@example.com"]
        },
        notInGroup: [],
        membersNotFound: []
      },
      refreshedTokenMessage: testRes.locals.refreshedTokenMessage
    });
  });

  test("Should return 400 if the group does not exist", async () => {
    Group.findOne.mockResolvedValueOnce(null);
    await removeFromGroup(testReq, testRes);
    expect(statusSpy).toHaveBeenCalledWith(400);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "There is no Group with this name" });

  });

  test("Should return 400 if memberEmails is missing in the request body", async () => {
    
    Group.findOne.mockResolvedValueOnce({});
    testReq.body = {};
    await removeFromGroup(testReq, testRes);

    expect(statusSpy).toHaveBeenCalledWith(400);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "Incomplete request body" });

  });

  test("Should return 400 if memberEmails are not in valid format", async () => {
    const group = {
      name: "testGroup",
      members: [{ email: "test1@example.com", user: { email: "test1@example.com" } }]
    };
    Group.findOne.mockResolvedValueOnce(group);
    verifyAuth.mockReturnValueOnce({ authorized: true });
    verifyAuth.mockReturnValueOnce({ authorized: true });
    testReq.body.memberEmails = ["test1@example.com", "invalidEmail"];

    await removeFromGroup(testReq, testRes);

    expect(statusSpy).toHaveBeenCalledWith(400);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "Invalid memberEmail format" });

  });

  test("Should return 400 if removing the last member of the group", async () => {
    const group = {
      name: "testGroup",
      members: [{ email: "test1@example.com", user: { email: "test1@example.com" } }]
    };
    Group.findOne.mockResolvedValueOnce(group);
    verifyAuth.mockReturnValueOnce({ authorized: true });
    verifyAuth.mockReturnValueOnce({ authorized: true });
    testReq.body.memberEmails = ["test1@example.com"];

    await removeFromGroup(testReq, testRes);

    expect(statusSpy).toHaveBeenCalledWith(400);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "You cannot remove the last member of the group!" });
    
  });

  test("Should return 400 if memberEmails do not exist or are not in the group", async () => {
    const group = {
      name: "testGroup",
      members: [{ email: "test1@example.com"} ,{ email: "test3@example.com"}]
    };
    const user1 = { email: "test2@example.com" };
    Group.findOne.mockResolvedValueOnce(group);
    verifyAuth.mockReturnValueOnce({ authorized: true });
    verifyAuth.mockReturnValueOnce({ authorized: true });
    User.find.mockResolvedValueOnce([user1]);
    
    await removeFromGroup(testReq, testRes);

    expect(statusSpy).toHaveBeenCalledWith(400);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "Member emails either do not exist or are not in the group" });
   
  });

  test("Should return 401 if not authorized as an admin or a group member", async () => {
    const group = {
      name: "testGroup",
      members: [{ email: "test1@example.com", user: { email: "test1@example.com" } }]
    };
    Group.findOne.mockResolvedValueOnce(group);
    verifyAuth.mockReturnValueOnce({ authorized: false, cause: "Unauthorized" });
    verifyAuth.mockReturnValueOnce({ authorized: false, cause: "Unauthorized" });

    await removeFromGroup(testReq, testRes);

    expect(statusSpy).toHaveBeenCalledWith(401);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "Unauthorized" });
 
  });

 test("Should return 500 if there is a Server Error", async () => {
    Group.findOne.mockRejectedValueOnce(new Error("Database error"));

    await removeFromGroup(testReq, testRes);

    expect(statusSpy).toHaveBeenCalledWith(500);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "Database error" });
  });
  
  test("Should keep the first member when removing all members from the group", async () => {
    const group = {
      name: "testGroup",
      members: [
        { email: "test1@example.com" },
        { email: "test2@example.com" },
        { email: "test3@example.com" }
      ]
    };
    const user1 = { email: "test1@example.com" };
    const user2 = { email: "test2@example.com" };
    const user3 = { email: "test3@example.com" };
    Group.findOne.mockResolvedValueOnce(group);
    verifyAuth.mockReturnValueOnce({ authorized: true });
    verifyAuth.mockReturnValueOnce({ authorized: true });
    User.find.mockResolvedValueOnce([user1, user2, user3]);
    Group.updateOne.mockResolvedValueOnce();
    testReq.body.memberEmails = ["test1@example.com", "test2@example.com", "test3@example.com"];
  
    await removeFromGroup(testReq, testRes);
  
    expect(statusSpy).toHaveBeenCalledWith(200);
    expect(jsonSpy).toHaveBeenCalledWith({
      data: {
        group: {
          name: "testGroup",
          members: ["test1@example.com"]
        },
        notInGroup: [],
        membersNotFound: []
      },
      refreshedTokenMessage: testRes.locals.refreshedTokenMessage
    });
  });
  


});

describe("deleteUser", () => {
  let testReq;
  let testRes;
  let statusSpy;
  let jsonSpy;

  beforeEach(() => {
    statusSpy = jest.fn().mockReturnThis();
    jsonSpy = jest.fn();
    testReq = {
      body: { email: "test@example.com" },
    };
    testRes = {
      status: statusSpy,
      json: jsonSpy,
      locals: {
        refreshedTokenMessage: "Token message",
      },
    };
    verifyAuth.mockReturnValue({ authorized: true });
  });

  afterEach(() => {
    User.findOne.mockClear();
    User.deleteOne.mockClear();
    Group.findOne.mockClear();
    Group.deleteOne.mockClear();
    transactions.deleteMany.mockClear();
    verifyAuth.mockClear();
    jest.clearAllMocks();
  });

  test("Should delete a user and remove from group", async () => {
    const user = {
      email: "test@example.com",
      username: "testuser",
      role: "Member",
    };
    const group = {
      name: "testGroup",
      members: [{ email: "test@example.com"}],
    };
    User.findOne.mockResolvedValueOnce(user);
    Group.findOne.mockResolvedValueOnce(group);
    Group.deleteOne.mockResolvedValueOnce();
    transactions.deleteMany.mockResolvedValueOnce({ deletedCount: 5 });

    await deleteUser(testReq, testRes);

    expect(statusSpy).toHaveBeenCalledWith(200);
    expect(jsonSpy).toHaveBeenCalledWith({
      data: {
        deletedTransactions: 5,
        deletedFromGroup: true,
      },
      refreshedTokenMessage: testRes.locals.refreshedTokenMessage,
    });
    expect(User.deleteOne).toHaveBeenCalledWith({ username: user.username });
    expect(Group.deleteOne).toHaveBeenCalledWith({ name: group.name });
    expect(transactions.deleteMany).toHaveBeenCalledWith({ username: user.username });
  });
  test("Should delete a user and remove from group", async () => {
    const user = {
      email: "test@example.com",
      username: "testuser",
      role: "Member",
    };
    const group = {
      name: "testGroup",
      members: [
        { email: "test@example.com" },
        { email: "test1@example.com" },
      ],
    };
    User.findOne.mockResolvedValueOnce(user);
    Group.findOne.mockResolvedValueOnce(group);
    Group.deleteOne.mockResolvedValueOnce();
    transactions.deleteMany.mockResolvedValueOnce({ deletedCount: 5 });
  
    await deleteUser(testReq, testRes);
  
    expect(statusSpy).toHaveBeenCalledWith(200);
    expect(jsonSpy).toHaveBeenCalledWith({
      data: {
        deletedTransactions: 5,
        deletedFromGroup: true,
      },
      refreshedTokenMessage: testRes.locals.refreshedTokenMessage,
    });
    expect(Group.updateOne).toHaveBeenCalledWith(
      { name: group.name },
      { name: group.name, members: [{ email: "test1@example.com" }] }
    );
  });
  
  test("Should return 400 if email is missing in the request body", async () => {
    testReq.body = {};

    await deleteUser(testReq, testRes);

    expect(statusSpy).toHaveBeenCalledWith(400);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "Incomplete request body" });
 
  });

  test("Should return 400 if email is not in valid format", async () => {
    testReq.body.email = "invalidEmail";

    await deleteUser(testReq, testRes);

    expect(statusSpy).toHaveBeenCalledWith(400);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "Invalid memberEmail format" });

  });

  test("Should return 400 if the user does not exist", async () => {
    User.findOne.mockResolvedValueOnce(null);

    await deleteUser(testReq, testRes);

    expect(statusSpy).toHaveBeenCalledWith(400);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "User does not exist" });

  });

  test("Should return 400 if trying to delete an admin", async () => {
    const user = {
      email: "test@example.com",
      username: "testuser",
      role: "Admin",
    };
    User.findOne.mockResolvedValueOnce(user);

    await deleteUser(testReq, testRes);

    expect(statusSpy).toHaveBeenCalledWith(400);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "You cannot delete an Admin" });

  });

  test("Should return 500 if there is a Server Error", async () => {
    User.findOne.mockRejectedValueOnce(new Error("Database error"));

    await deleteUser(testReq, testRes);

    expect(statusSpy).toHaveBeenCalledWith(500);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "Database error" });

  });
  

  test("Should return 401 if not authorized as an admin", async () => {
    verifyAuth.mockReturnValueOnce({ authorized: false, cause: "Unauthorized" });

    await deleteUser(testReq, testRes);

    expect(statusSpy).toHaveBeenCalledWith(401);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "Unauthorized" });

  });
});

describe("deleteGroup", () => {
  let testReq;
  let testRes;
  let statusSpy;
  let jsonSpy;

  beforeEach(() => {
    statusSpy = jest.fn().mockReturnThis();
    jsonSpy = jest.fn();
    testReq = {
      body: { name: "testGroup" },
    };
    testRes = {
      status: statusSpy,
      json: jsonSpy,
      locals: {
        refreshedTokenMessage: "Token message",
      },
    };
    verifyAuth.mockReturnValue({ authorized: true });
  });

  afterEach(() => {
    Group.findOne.mockClear();
    Group.deleteOne.mockClear();
    verifyAuth.mockClear();
    jest.clearAllMocks();
  });

  test("Should delete a group", async () => {
    const group = {
      name: "testGroup",
    };
    Group.findOne.mockResolvedValueOnce(group);
    Group.deleteOne.mockResolvedValueOnce();

    await deleteGroup(testReq, testRes);

    expect(statusSpy).toHaveBeenCalledWith(200);
    expect(jsonSpy).toHaveBeenCalledWith({
      data: { message: "Group deleted successfully" },
      refreshedTokenMessage: testRes.locals.refreshedTokenMessage,
    });
    expect(Group.deleteOne).toHaveBeenCalledWith({ name: group.name });
  });

  test("Should return 400 if name is missing in the request body", async () => {
    testReq.body = {};

    await deleteGroup(testReq, testRes);

    expect(statusSpy).toHaveBeenCalledWith(400);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "Incomplete request body" });
  });

  test("Should return 400 if name is an empty string", async () => {
    testReq.body.name = "";

    await deleteGroup(testReq, testRes);

    expect(statusSpy).toHaveBeenCalledWith(400);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "Empty fields are not allowed" });
  });

  test("Should return 400 if the group does not exist", async () => {
    Group.findOne.mockResolvedValueOnce(null);

    await deleteGroup(testReq, testRes);

    expect(statusSpy).toHaveBeenCalledWith(400);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "Group does not exist" });
  });

  test("Should return 500 if there is a Server Error", async () => {
    Group.findOne.mockRejectedValueOnce(new Error("Database error"));

    await deleteGroup(testReq, testRes);

    expect(statusSpy).toHaveBeenCalledWith(500);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "Database error" });
  });

  test("Should return 401 if not authorized as an admin", async () => {
    verifyAuth.mockReturnValueOnce({ authorized: false, cause: "Unauthorized" });

    await deleteGroup(testReq, testRes);

    expect(statusSpy).toHaveBeenCalledWith(401);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "Unauthorized" });
  });
});
