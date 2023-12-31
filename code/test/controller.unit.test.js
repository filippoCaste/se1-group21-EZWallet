import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model';
import { createCategory, categoryTypeExists, userExistsByUsername, updateCategory, updatedCategory, deleteCategory, getCategories, createTransaction, getAllTransactions, getTransactionsByGroup, getTransactionsByUser, getTransactionsByUserByCategory, getTransactionsByGroupByCategory, deleteTransactions, deleteTransaction, checkEmptyParam } from '../controllers/controller.js';
import * as Utils from '../controllers/utils'
import { verifyAuth } from '../controllers/utils.js';
import { Group, User } from '../models/User';
import mongoose from 'mongoose';


// Mock the dependencies
jest.mock('../models/User.js');
jest.mock('../controllers/utils.js');
jest.mock('../models/model.js');


describe("createCategory", () => {
    let testReq;
    let testRes;
    let statusSpy;
    let jsonSpy;
    beforeEach(() => {

        categories.findOne.mockClear();
        categories.prototype.save.mockClear();

        testReq = {
            body: {
                type: "type",
                color: "color"
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
        verifyAuth.mockReturnValue({ authorized: true });
        categories.findOne.mockResolvedValue(false);
        categories.prototype.save.mockResolvedValue(testReq.body);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Should successfully create a Category", async () => {
        await createCategory(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(200);
        expect(testRes.json).toHaveBeenCalledWith({ data: testReq.body, refreshedTokenMessage: testRes.locals.refreshedTokenMessage });
    });

    test("Should return 400 error if the body is missing a parameter", async () => {
        testReq.body = { type: "type" };
        await createCategory(testReq, testRes)
        expect(testRes.status).toHaveBeenCalledWith(400)
        expect(testRes.json).toHaveBeenCalledWith({ error: "Not enough parameters." })
    })

    test("Should return 400 if at least one of the parameters in the request body is an empty string", async () => {
        testReq.body.type = '';
        await createCategory(testReq, testRes)
        expect(testRes.status).toHaveBeenCalledWith(400)
        expect(testRes.json).toHaveBeenCalledWith({ error: "Empty parameters are not allowed." })
    })

    test("Should return 401 if the User is not an authorized", async () => {
        verifyAuth.mockReturnValue({ authorized: false, cause: "Unauthorized" });
        await createCategory(testReq, testRes)
        expect(testRes.status).toHaveBeenCalledWith(401)
        expect(testRes.json).toHaveBeenCalledWith({ error: "Unauthorized" })
    })

    test("Should return 400 if a category with the same type already exists", async () => {
        categories.findOne.mockReturnValue(true);
        await createCategory(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(400);
        expect(testRes.json).toHaveBeenCalledWith({ error: "This category already exist." });
    });

    test("Should return 500 if there is a Server Error", async () => {
        categories.prototype.save.mockImplementation(() => { throw new Error('Server error') });
        await createCategory(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(500);
        expect(testRes.json).toHaveBeenCalledWith({ error: "Server error" });
    });



})

describe("updateCategory", () => {
    let testReq;
    let testRes;
    let statusSpy;
    let jsonSpy;
    beforeEach(() => {
        jest.clearAllMocks();
        categories.findOne.mockClear();
        categories.updateOne.mockClear();
        transactions.updateMany.mockClear();
        verifyAuth.mockClear();

        testReq = {
            params: {
                type: "old_type"
            },
            body: {
                type: "new_type",
                color: "new_color"
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
        verifyAuth.mockReturnValue({ authorized: true });
        categories.updateOne.mockResolvedValue({ nModified: 1 });
        transactions.updateMany.mockResolvedValue({ modifiedCount: 2 });
    });

    test("Should successfully update a Category", async () => {
        categories.findOne.mockResolvedValueOnce({});
        await updateCategory(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(200);
        expect(testRes.json).toHaveBeenCalledWith({
            data: {
                message: "Category updated",
                count: 2
            },
            refreshedTokenMessage: testRes.locals.refreshedTokenMessage
        });
    });
    test("Should return 401 if the User is not authorized", async () => {
        verifyAuth.mockReturnValue({ authorized: false, cause: "Unauthorized" });
        await updateCategory(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(401);
        expect(testRes.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    });
    test("Should return 400 if the specified URL category does not exist", async () => {

        categories.findOne.mockResolvedValueOnce(null);

        await updateCategory(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(400);
        expect(testRes.json).toHaveBeenCalledWith({ error: "The specified URL category does not exist" });
    });
    test("Should return 400 if not enough parameters are provided in the request body", async () => {
        testReq.body = { type: "new_type" };
        categories.findOne.mockResolvedValueOnce({});
        await updateCategory(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(400);
        expect(testRes.json).toHaveBeenCalledWith({ error: "Not enough parameters." });
    });
    test("Should return 400 if any parameter in the request body is an empty string", async () => {
        testReq.body.type = "";
        categories.findOne.mockResolvedValueOnce({});
        await updateCategory(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(400);
        expect(testRes.json).toHaveBeenCalledWith({ error: "Empty parameters are not allowed." });
    });
    test("Should return 400 if the specified URL category already exists", async () => {
        categories.findOne.mockResolvedValueOnce({});
        categories.findOne.mockResolvedValueOnce({});
        await updateCategory(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(400);
        expect(testRes.json).toHaveBeenCalledWith({ error: "The specified URL category already exist" });
    });
    test("Should return 500 if there is a Server Error", async () => {
        categories.findOne.mockRejectedValue(new Error('Server error'));
        await updateCategory(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(500);
        expect(testRes.json).toHaveBeenCalledWith({ error: "Server error" });
    });
});

describe("deleteCategory", () => {
    let testReq;
    let testRes;
    let statusSpy;
    let jsonSpy;
    beforeEach(() => {
        jest.clearAllMocks();
        verifyAuth.mockClear();
        categories.countDocuments.mockClear();
        categories.deleteMany.mockClear();
        categories.findOne.mockClear();
        transactions.updateMany.mockClear();

        testReq = {
            body: {
                types: ["type1", "type2"]
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
        verifyAuth.mockReturnValue({ authorized: true });
        categories.countDocuments.mockResolvedValue(2);
        categories.deleteMany.mockResolvedValue({ nModified: 2 });
        categories.findOne.mockResolvedValue({});
        transactions.updateMany.mockResolvedValue({ modifiedCount: 2 });
    });

    test("Should successfully delete categories", async () => {
        await deleteCategory(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(200);
        expect(testRes.json).toHaveBeenCalledWith({
            data: {
                message: "Categories deleted",
                count: 2
            },
            refreshedTokenMessage: testRes.locals.refreshedTokenMessage
        });
    });

    test("Should return 401 if the User is not authorized", async () => {
        verifyAuth.mockReturnValue({ authorized: false, cause: "Unauthorized" });
        await deleteCategory(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(401);
        expect(testRes.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    test("Should return 400 if not enough parameters are provided in the request body", async () => {
        testReq.body = {};
        await deleteCategory(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(400);
        expect(testRes.json).toHaveBeenCalledWith({ error: "Not enough parameters." });
    });

    test("Should return 400 if the array passed in the request body is empty", async () => {
        testReq.body.types = [];
        await deleteCategory(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(400);
        expect(testRes.json).toHaveBeenCalledWith({ error: "The array passed in the request body is empty" });
    });

    test("Should return 400 if any parameter in the request body is an empty string", async () => {
        testReq.body.types = ["type1", ""];
        await deleteCategory(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(400);
        expect(testRes.json).toHaveBeenCalledWith({ error: "Empty parameters are not allowed." });
    });

    test("Should return 400 if the specified category does not exist", async () => {
        categories.findOne.mockResolvedValueOnce(null);
        await deleteCategory(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(400);
        expect(testRes.json).toHaveBeenCalledWith({ error: "The specified category does not exist." });
    });

    test("Should return 400 if there is only one category remaining", async () => {
        categories.countDocuments.mockResolvedValueOnce(1);
        await deleteCategory(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(400);
        expect(testRes.json).toHaveBeenCalledWith({ error: "You cannot delete the remaining category." });
    });

    test("Should return 400 if there are missing categories to be deleted", async () => {
        categories.countDocuments.mockResolvedValueOnce(0);
        await deleteCategory(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(400);
        expect(testRes.json).toHaveBeenCalledWith({ error: "Missing categories to be deleted" });
    });

    test("Should delete specified categories and update transactions with the oldest category if not all categories are to be deleted", async () => {
        categories.countDocuments.mockResolvedValue(3);

        await deleteCategory(testReq, testRes);
        expect(categories.deleteMany).toHaveBeenCalledWith({ type: { $in: ["type1", "type2"] } });
        expect(transactions.updateMany).toHaveBeenCalledWith(
            { type: { $in: ["type1", "type2"], $ne: undefined } },
            { $set: { type: undefined } }
        );
    });

    test("Should return 500 if there is a Server Error", async () => {
        categories.countDocuments.mockRejectedValue(new Error('Server error'));
        await deleteCategory(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(500);
        expect(testRes.json).toHaveBeenCalledWith({ error: "Server error" });
    });
});

describe("getCategories", () => {
    let testReq;
    let testRes;
    let statusSpy;
    let jsonSpy;

    beforeEach(() => {
        statusSpy = jest.fn().mockReturnThis();
        jsonSpy = jest.fn();

        testReq = {};

        testRes = {
            status: statusSpy,
            json: jsonSpy,
            locals: {
                refreshedTokenMessage: "Token refreshed"
            }
        };

        verifyAuth.mockReturnValue({ authorized: true });
        categories.find.mockResolvedValue([{ type: "type1", color: "color1" }, { type: "type2", color: "color2" }]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Should return all categories", async () => {
        await getCategories(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(200);
        expect(testRes.json).toHaveBeenCalledWith({
            data: [{ type: "type1", color: "color1" }, { type: "type2", color: "color2" }],
            refreshedTokenMessage: testRes.locals.refreshedTokenMessage
        });
    });

    test("Should return empty array if there are no categories", async () => {
        categories.find.mockResolvedValue([]);
        await getCategories(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(200);
        expect(testRes.json).toHaveBeenCalledWith({ data: [], refreshedTokenMessage: testRes.locals.refreshedTokenMessage });
    });

    test("Should return 401 if User is not authorized", async () => {
        verifyAuth.mockReturnValue({ authorized: false, cause: "Unauthorized" });
        await getCategories(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(401);
        expect(testRes.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    test("Should return 500 if there is a Server Error", async () => {
        categories.find.mockRejectedValue(new Error("Server Error"));
        await getCategories(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(500);
        expect(testRes.json).toHaveBeenCalledWith({ error: "Server Error" });
    });
});

describe("createTransaction", () => {
    let testReq;
    let testRes;
    let statusSpy;
    let jsonSpy;

    beforeEach(() => {

        statusSpy = jest.fn().mockReturnThis();
        jsonSpy = jest.fn();

        testReq = {
            params: { username: "testUser" },
            body: { username: "testUser", amount: 10.0, type: "testCategory", date: Date.now() },
            cookies: { refreshToken: "testRefreshToken" }
        };

        testRes = {
            status: statusSpy,
            json: jsonSpy,
            locals: {
                refreshedTokenMessage: "Token message"
            }
        };

        verifyAuth.mockReturnValue({ authorized: true });
        User.findOne.mockResolvedValue({ username: "testUser" });
        categories.findOne.mockResolvedValue({ type: "testCategory" });
        transactions.prototype.save.mockResolvedValue(testReq.body);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Should successfully create a transaction", async () => {
        await createTransaction(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(200);
        expect(testRes.json).toHaveBeenCalledWith({
            data: testReq.body,
            refreshedTokenMessage: testRes.locals.refreshedTokenMessage
        });
    });

    test("Should return 401 if the User is not an authorized", async () => {
        verifyAuth.mockReturnValue({ authorized: false, cause: "Unauthorized" });
        await createTransaction(testReq, testRes)
        expect(testRes.status).toHaveBeenCalledWith(401)
        expect(testRes.json).toHaveBeenCalledWith({ error: "Unauthorized" })
    })

    test("Should return 400 if some parameters are missing", async () => {
        testReq.body = { username: "testUser", amount: 10.0 };
        await createTransaction(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(400);
        expect(testRes.json).toHaveBeenCalledWith({ error: "Not enough parameters." });
    });

    test("Should return 400 if some parameters are empty", async () => {
        testReq.body = { username: "", amount: 10.0, type: "testCategory" };
        await createTransaction(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(400);
        expect(testRes.json).toHaveBeenCalledWith({ error: "Empty parameters are not allowed." });
    });

    test("Should return 400 if URL username does not exist", async () => {
        User.findOne.mockResolvedValue(null);
        await createTransaction(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(400);
        expect(testRes.json).toHaveBeenCalledWith({ error: "The provided URL username does not exist." });
    });

    test("Should return 400 if username does not exist", async () => {
        User.findOne.mockResolvedValueOnce({ username: "testUser" });
        User.findOne.mockResolvedValueOnce(null);
        await createTransaction(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(400);
        expect(testRes.json).toHaveBeenCalledWith({ error: "The provided username does not exist." });
    });

    test("Should return 400 if category does not exist", async () => {
        categories.findOne.mockResolvedValue(null);
        await createTransaction(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(400);
        expect(testRes.json).toHaveBeenCalledWith({ error: "The provided category does not exist." });
    });

    test("Should return 400 if username and URL username mismatch", async () => {
        testReq.params.username = "differentUser";
        await createTransaction(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(400);
        expect(testRes.json).toHaveBeenCalledWith({ error: "Missmatching users." });
    });

    test("Should return 400 if amount is invalid", async () => {
        testReq.body.amount = "invalidAmount";
        await createTransaction(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(400);
        expect(testRes.json).toHaveBeenCalledWith({ error: "Invalid amount." });
    });


    test("Should return 500 if there is a Server Error", async () => {
        transactions.prototype.save.mockImplementation(() => { throw new Error('Server error') });
        await createTransaction(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(500);
        expect(testRes.json).toHaveBeenCalledWith({ error: "Server error" });
    });
});

describe("getAllTransactions", () => {
    let testReq;
    let testRes;
    let statusSpy;
    let jsonSpy;

    beforeEach(() => {
        statusSpy = jest.fn().mockReturnThis();
        jsonSpy = jest.fn();

        testReq = {
            cookies: { refreshToken: "testRefreshToken" }
        };

        testRes = {
            status: statusSpy,
            json: jsonSpy,
            locals: {
                refreshedTokenMessage: "Token message"
            }
        };


        transactions.aggregate.mockResolvedValue([
            {
                username: "testUser",
                amount: 10.0,
                type: "testCategory",
                date: "2023-06-02",
                categories_info: { color: "testColor" }
            }
        ]);
        verifyAuth.mockReturnValue({ authorized: true });
        User.findOne.mockResolvedValue({ username: "testUser" });
        categories.findOne.mockResolvedValue({ type: "testCategory" });

    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Should return transactions data if the User is authorized", async () => {
        await getAllTransactions(testReq, testRes);

        expect(transactions.aggregate).toHaveBeenCalled();
        expect(testRes.json).toHaveBeenCalledWith({
            data: [
                {
                    username: "testUser",
                    amount: 10.0,
                    type: "testCategory",
                    date: "2023-06-02",
                    color: "testColor"
                }
            ],
            refreshedTokenMessage: "Token message"
        });
    });

    test("Should return 401 if the User is not an authorized", async () => {
        verifyAuth.mockReturnValue({ authorized: false, cause: "Unauthorized" });
        await getAllTransactions(testReq, testRes)
        expect(testRes.status).toHaveBeenCalledWith(401)
        expect(testRes.json).toHaveBeenCalledWith({ error: "Unauthorized" })
    })

    test("Should return 500 if there is a Server Error", async () => {
        transactions.aggregate.mockImplementation(() => { throw new Error('Server error') })
        await getAllTransactions(testReq, testRes);
        expect(statusSpy).toHaveBeenCalledWith(500);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "Server error" });

    });


});

describe("getTransactionsByUser", () => {
    let testReq;
    let testRes;
    let statusSpy;
    let jsonSpy;

    beforeEach(() => {
        statusSpy = jest.fn().mockReturnThis();
        jsonSpy = jest.fn();

        testReq = {
            params: { username: "testUser" },
            cookies: { refreshToken: "testRefreshToken" },
            path: "/users/testUser/transactions"
        };

        testRes = {
            status: statusSpy,
            json: jsonSpy,
            locals: {
                refreshedTokenMessage: "Token message"
            }
        };

        verifyAuth.mockReturnValue({ authorized: true });
        User.findOne.mockResolvedValue({ username: "testUser" });
        categories.findOne.mockResolvedValue({ type: "testCategory" });

        transactions.aggregate.mockResolvedValue([
            {
                username: "testUser",
                amount: 10.0,
                type: "testCategory",
                date: Date.now,
                categories_info: {
                    type: "testType",
                    color: "testColor"
                }
            }
        ]);

    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Should return all transactions for the specified regular user", async () => {
        await getTransactionsByUser(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(200);
        expect(testRes.json).toHaveBeenCalledWith({
            data: [
                {
                    username: "testUser",
                    amount: 10.0,
                    type: "testCategory",
                    date: Date.now,
                    color: "testColor"
                }
            ],
            refreshedTokenMessage: testRes.locals.refreshedTokenMessage
        });
    });

    test("Should return 401 if not authorized", async () => {
        verifyAuth.mockReturnValue({ authorized: false, cause: "Unauthorized" });
        await getTransactionsByUser(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(401);
        expect(testRes.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    test("Should return 401 if authorized but in the wrong path", async () => {
        verifyAuth.mockReturnValueOnce({ authorized: false, cause: "Unauthorized" });
        testReq.path = "/transactions/users/testUser";
        await getTransactionsByUser(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(401);
        expect(testRes.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    });


    test("Should return 400 if the user does not exist", async () => {
        testReq.path = "/transactions/users/testUser";
        User.findOne.mockResolvedValue(false);
        await getTransactionsByUser(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(400);
        expect(testRes.json).toHaveBeenCalledWith({ error: "The provided URL username does not exist." });
    });

    test("Should return filtered transactions based on query parameters", async () => {

        testReq.query = "aVeryComplicateQuery"

        Utils.handleAmountFilterParams.mockResolvedValue();
        Utils.handleDateFilterParams.mockResolvedValue();

        await getTransactionsByUser(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(200);
        expect(testRes.json).toHaveBeenCalledWith({
            data: [
                {
                    username: "testUser",
                    amount: 10.0,
                    type: "testCategory",
                    date: Date.now,
                    color: "testColor"
                }
            ],
            refreshedTokenMessage: testRes.locals.refreshedTokenMessage
        });
    });

    test("Should return 500 if there is a Server Error", async () => {
        transactions.aggregate.mockImplementation(() => { throw new Error('Server error') })
        await getTransactionsByUser(testReq, testRes);
        expect(statusSpy).toHaveBeenCalledWith(500);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "Server error" });
    });
});

describe("getTransactionsByUserByCategory", () => {
    let testReq;
    let testRes;
    let statusSpy;
    let jsonSpy;

    beforeEach(() => {
        statusSpy = jest.fn().mockReturnThis();
        jsonSpy = jest.fn();

        testReq = {
            params: { username: "testUser", category: "testCategory" },
            cookies: { refreshToken: "testRefreshToken" },
            path: "/transactions/users/testUser/category/testCategory",
        };

        testRes = {
            status: statusSpy,
            json: jsonSpy,
            locals: {
                refreshedTokenMessage: "Token message",
            },
        };

        verifyAuth.mockReturnValue({ authorized: true });
        User.findOne.mockResolvedValue(true);
        categories.findOne.mockResolvedValue(true);
        transactions.aggregate.mockResolvedValue([
            {
                username: "testUser",
                amount: 10.0,
                type: "testCategory",
                date: Date.now,
                categories_info: {
                    color: "testColor",
                },
            },
        ]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Should return transactions for the specified user and category", async () => {
        await getTransactionsByUserByCategory(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(200);
        expect(testRes.json).toHaveBeenCalledWith({
            data: [
                {
                    username: "testUser",
                    amount: 10.0,
                    type: "testCategory",
                    date: Date.now,
                    color: "testColor",
                },
            ],
            refreshedTokenMessage: testRes.locals.refreshedTokenMessage,
        });
    });

    test("Should return 400 if the user does not exist", async () => {
        User.findOne.mockResolvedValue(false);
        await getTransactionsByUserByCategory(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(400);
        expect(testRes.json).toHaveBeenCalledWith({
            error: "The provided URL username does not exist.",
        });
    });

    test("Should return 400 if the category does not exist", async () => {
        categories.findOne.mockResolvedValue(false);
        await getTransactionsByUserByCategory(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(400);
        expect(testRes.json).toHaveBeenCalledWith({
            error: "The provided URL category does not exist.",
        });
    });

    test("Should return 401 if not authorized as admin", async () => {
        verifyAuth.mockReturnValue({ authorized: false, cause: "Unauthorized" });
        await getTransactionsByUserByCategory(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(401);
        expect(testRes.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    test("Should return 401 if authorized as User but in the admin path", async () => {
        verifyAuth.mockReturnValueOnce({ authorized: false, cause: "Unauthorized" });
        testReq.path = "/transactions/users/testUser/category/testCategory";
        await getTransactionsByUserByCategory(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(401);
        expect(testRes.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    test("Should return 500 if there is a server error", async () => {
        transactions.aggregate.mockImplementation(() => {
            throw new Error("Server error");
        });
        await getTransactionsByUserByCategory(testReq, testRes);
        expect(statusSpy).toHaveBeenCalledWith(500);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "Server error" });
    });
});

describe("getTransactionsByGroup", () => {
    let testReq;
    let testRes;
    let statusSpy;
    let jsonSpy;

    beforeEach(() => {
        statusSpy = jest.fn().mockReturnThis();
        jsonSpy = jest.fn();

        testReq = {
            params: { name: "testGroup" },
            path: "/transactions/groups/testGroup",
        };

        testRes = {
            status: statusSpy,
            json: jsonSpy,
            locals: {
                refreshedTokenMessage: "Token message",
            },
        };

        verifyAuth.mockReturnValue({ authorized: true });
        Group.findOne.mockResolvedValue({
            name: "testGroup",
            members: [{ email: "member1@example.com" }, { email: "member2@example.com" }],
        });
        User.find.mockResolvedValue([
            { username: "user1", email: "member1@example.com" },
            { username: "user2", email: "member2@example.com" },
        ]);

        transactions.aggregate.mockResolvedValue([
            {
                username: "user1",
                amount: 10.0,
                type: "testCategory",
                date: Date.now(),
                categories_info: {
                    type: "testType",
                    color: "testColor",
                },
            },
        ]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Should return transactions for the specified group", async () => {
        await getTransactionsByGroup(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(200);
        expect(testRes.json).toHaveBeenCalledWith({
            data: [
                {
                    username: "user1",
                    amount: 10.0,
                    type: "testCategory",
                    date: expect.any(Number),
                    color: "testColor",
                },
            ],
            refreshedTokenMessage: testRes.locals.refreshedTokenMessage,
        });
    });

    test("Should return 400 if the group does not exist", async () => {
        Group.findOne.mockResolvedValue(false);
        await getTransactionsByGroup(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(400);
        // expect(testRes.json).toHaveBeenCalledWith({
        //     error: "There is no Group with this name",
        // });
    });

    test("Should return 401 if not authorized as admin or group member", async () => {
        verifyAuth.mockReturnValue({ authorized: false, cause: "Unauthorized" });
        await getTransactionsByGroup(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(401);
        expect(testRes.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    test("Should return 500 if there is a Server Error", async () => {
        transactions.aggregate.mockImplementation(() => {
            throw new Error("Server error");
        });
        await getTransactionsByGroup(testReq, testRes);
        expect(statusSpy).toHaveBeenCalledWith(500);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "Server error" });
    });
});

describe("getTransactionsByGroupByCategory", () => {
    let testReq;
    let testRes;
    let statusSpy;
    let jsonSpy;

    beforeEach(() => {
        statusSpy = jest.fn().mockReturnThis();
        jsonSpy = jest.fn();

        testReq = {
            params: { name: "testGroup", category: "testCategory" },
            path: "/transactions/groups/testGroup/category/testCategory"
        };

        testRes = {
            status: statusSpy,
            json: jsonSpy,
            locals: {
                refreshedTokenMessage: "Token message"
            }
        };

        verifyAuth.mockReturnValue({ authorized: true });
        Group.findOne.mockResolvedValue({ name: "testGroup", members: [] });
        User.find.mockResolvedValue([]);
        transactions.aggregate.mockResolvedValue([
            {
                username: "testUser",
                amount: 10.0,
                type: "testCategory",
                date: Date.now,
                categories_info: {
                    type: "testType",
                    color: "testColor"
                }
            }
        ]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Should return transactions grouped by category for the specified group", async () => {
        await getTransactionsByGroupByCategory(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(200);
        expect(testRes.json).toHaveBeenCalledWith({
            data: [
                {
                    username: "testUser",
                    amount: 10.0,
                    type: "testCategory",
                    date: Date.now,
                    color: "testColor"
                }
            ],
            refreshedTokenMessage: testRes.locals.refreshedTokenMessage
        });
    });

    test("Should return 400 if the group does not exist", async () => {
        Group.findOne.mockResolvedValue(false);
        await getTransactionsByGroupByCategory(testReq, testRes);

        expect(testRes.status).toHaveBeenCalledWith(400);
        expect(testRes.json).toHaveBeenCalledWith({
            error: "There is no Group with this name"
        });
    });

    test("Should return 400 if the category does not exist", async () => {
        Group.findOne.mockResolvedValueOnce(true);
        categories.findOne.mockResolvedValueOnce(null);
        await getTransactionsByGroupByCategory(testReq, testRes);

        expect(testRes.status).toHaveBeenCalledWith(400);
        expect(testRes.json).toHaveBeenCalledWith({
            error: "Category type does not exist"
        });
    });

    test("Should return 401 if not authorized as admin or group member", async () => {
        verifyAuth.mockReturnValue({ authorized: false, cause: "Unauthorized" });
        await getTransactionsByGroupByCategory(testReq, testRes);

        expect(testRes.status).toHaveBeenCalledWith(401);
        expect(testRes.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    test("Should return 500 if there is a Server Error", async () => {
        transactions.aggregate.mockImplementation(() => {
            throw new Error("Server error");
        });
        await getTransactionsByGroupByCategory(testReq, testRes);
        expect(statusSpy).toHaveBeenCalledWith(500);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "Server error" });
    });
});

describe("deleteTransaction", () => {
    let testReq;
    let testRes;
    let statusSpy;
    let jsonSpy;

    beforeEach(() => {
        jest.clearAllMocks();

        statusSpy = jest.fn().mockReturnThis();
        jsonSpy = jest.fn();
        mongoose.isValidObjectId = jest.fn();
        testReq = {
            params: { username: "testUser" },
            body: { _id: "testId" },
        };

        testRes = {
            status: statusSpy,
            json: jsonSpy,
            locals: {
                refreshedTokenMessage: "Token message"
            }
        };

        verifyAuth.mockReturnValue({ authorized: true });
        User.findOne.mockResolvedValue(true);
        mongoose.isValidObjectId.mockReturnValue(true);
        transactions.findById.mockResolvedValue({ username: "testUser" });
        transactions.findByIdAndDelete.mockResolvedValue();

    });

    afterEach(() => {
        jest.clearAllMocks();
        transactions.findById.mockClear();
        transactions.findByIdAndDelete.mockClear();
        User.findOne.mockClear();
    });

    test("Should delete the transaction for the specified user", async () => {
        await deleteTransaction(testReq, testRes);
        expect(statusSpy).toHaveBeenCalledWith(200);
        expect(jsonSpy).toHaveBeenCalledWith({ data: { message: "Transaction deleted" }, refreshedTokenMessage: testRes.locals.refreshedTokenMessage });
        expect(transactions.findByIdAndDelete).toHaveBeenCalledWith("testId");
    });

    test("Should return 401 if not authorized", async () => {
        verifyAuth.mockReturnValue({ authorized: false, cause: "Unauthorized" });
        await deleteTransaction(testReq, testRes);
        expect(statusSpy).toHaveBeenCalledWith(401);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "Unauthorized" });
        expect(transactions.findByIdAndDelete).not.toHaveBeenCalled();
    });

    test("Should return 400 if '_id' is not provided in the request body", async () => {
        testReq.body = {};
        await deleteTransaction(testReq, testRes);
        expect(statusSpy).toHaveBeenCalledWith(400);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "Not enough parameters." });
        expect(transactions.findByIdAndDelete).not.toHaveBeenCalled();
    });

    test("Should return 400 if '_id' is empty", async () => {
        testReq.body._id = '';
        await deleteTransaction(testReq, testRes);
        expect(statusSpy).toHaveBeenCalledWith(400);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "Empty parameters are not allowed." });
        expect(transactions.findByIdAndDelete).not.toHaveBeenCalled();
    });

    test("Should return 400 if the user does not exist", async () => {
        User.findOne.mockResolvedValue(false);
        await deleteTransaction(testReq, testRes);
        expect(statusSpy).toHaveBeenCalledWith(400);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "The provided URL username does not exist." });
        expect(transactions.findByIdAndDelete).not.toHaveBeenCalled();
    });

    test("Should return 400 if the provided id does not match any transaction", async () => {
        transactions.findById.mockResolvedValue(null);
        await deleteTransaction(testReq, testRes);
        expect(statusSpy).toHaveBeenCalledWith(400);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "The provided id does not match with any transaction in the db." });
        expect(transactions.findByIdAndDelete).not.toHaveBeenCalled();
    });

    test("Should return 400 if the user tries to delete other user's transaction", async () => {
        transactions.findById.mockResolvedValue({ username: "otherUser" });
        await deleteTransaction(testReq, testRes);
        expect(statusSpy).toHaveBeenCalledWith(400);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "You cannot delete other user Transactions" });
        expect(transactions.findByIdAndDelete).not.toHaveBeenCalled();
    });

    test("Should return 500 if there is a Server Error", async () => {
        transactions.findByIdAndDelete.mockRejectedValue(new Error('Server error'));
        await deleteTransaction(testReq, testRes);
        expect(statusSpy).toHaveBeenCalledWith(500);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "Server error" });
    });
});

describe("deleteTransactions", () => {
    let testReq;
    let testRes;
    let statusSpy;
    let jsonSpy;

    beforeEach(() => {
        statusSpy = jest.fn().mockReturnThis();
        jsonSpy = jest.fn();
        mongoose.isValidObjectId = jest.fn();
        testReq = {
            body: {
                _ids: ["testId1", "testId2"]
            },
        };

        testRes = {
            status: statusSpy,
            json: jsonSpy,
            locals: {
                refreshedTokenMessage: "Token message"
            }
        };

        verifyAuth.mockReturnValue({ authorized: true });
        mongoose.isValidObjectId.mockReturnValue(true);
        transactions.findById.mockResolvedValue({}); // Mock the findById function to return a valid transaction
        transactions.findByIdAndDelete.mockResolvedValue(); // Mock the findByIdAndDelete function

    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Should delete multiple transactions when authorized and valid parameters are provided", async () => {
        await deleteTransactions(testReq, testRes);
        expect(statusSpy).toHaveBeenCalledWith(200);
        expect(jsonSpy).toHaveBeenCalledWith({ data: { message: "Transactions deleted" }, refreshedTokenMessage: testRes.locals.refreshedTokenMessage });
    });

    test("Should return 401 if not authorized", async () => {
        verifyAuth.mockReturnValue({ authorized: false, cause: "Unauthorized" });
        await deleteTransactions(testReq, testRes);
        expect(statusSpy).toHaveBeenCalledWith(401);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    test("Should return 400 if '_ids' is not provided in the request body", async () => {
        testReq.body = {};
        await deleteTransactions(testReq, testRes);
        expect(statusSpy).toHaveBeenCalledWith(400);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "Not enough parameters." });
    });

    test("Should return 400 if there is at least one id empty", async () => {
        testReq.body._ids = ["testId1", ""];
        await deleteTransactions(testReq, testRes);
        expect(statusSpy).toHaveBeenCalledWith(400);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "Empty parameters are not allowed." });
    });

    test("Should return 400 if any of the provided ids do not match any transaction", async () => {
        transactions.findById.mockResolvedValue(null);
        await deleteTransactions(testReq, testRes);
        expect(statusSpy).toHaveBeenCalledWith(400);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "One of the provided ids does not match with any transaction in the db." });

    });

    test("Should return 500 if there is a Server Error", async () => {
        transactions.findById.mockRejectedValue(new Error('Server error'));
        await deleteTransactions(testReq, testRes);
        expect(statusSpy).toHaveBeenCalledWith(500);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "Server error" });
    });
});



