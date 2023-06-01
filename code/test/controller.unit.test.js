import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model';
import { createCategory, categoryTypeExists, updateCategory, updatedCategory, deleteCategory, getCategories, createTransaction, getAllTransactions, getTransactionsByGroup, getTransactionsByUser, getTransactionsByUserByCategory, getTransactionsByGroupByCategory, deleteTransactions, deleteTransaction, checkEmptyParam } from '../controllers/controller.js';
import * as Utils from '../controllers/utils'
import { verifyAuth } from '../controllers/utils.js';


// Mock the dependencies
jest.mock('../models/User.js');
jest.mock('../controllers/utils.js');
jest.mock('../models/model.js');


/*

TO PUT INSIDE EVERY DESCRIBE
-only the needed ones

beforeEach(() => {
    categories.find.mockClear();
    categories.findOne.mockClear();
    categories.updateOne.mockClear();
    categories.deleteMany.mockClear();
    transactions.updateMany.mockClear();
    categories.updateMany.mockClear();
    categories.updateOne.mockClear();


    categories.prototype.save.mockClear();
    transactions.find.mockClear();
    transactions.deleteOne.mockClear();
    transactions.aggregate.mockClear();
    transactions.prototype.save.mockClear();

});

*/

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
                refreshedTokenMessage: "Token refreshed"
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
        expect(testRes.json).toHaveBeenCalledWith({ error: "Empty parameteres are not allowed." })
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
        expect(testRes.json).toHaveBeenCalledWith({ error: "This category already exists." });
    });

    test("Should return 500 if there is a Server Error", async () => {
        categories.prototype.save.mockImplementation(() => { throw new Error('Category creation error') });
        await createCategory(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(500);
        expect(testRes.json).toHaveBeenCalledWith({ error: "Category creation error" });
    });

   

})

/*
describe("updateCategory", () => {

    test('Invalid color', async () => {
        // Mock request and response objects
        const testReq = {
            params: {
                id: 'categoryId',
            },
            body: {
                name: 'Updated Category',
                color: 'updated-color',
            },
            user: {
                id: 'userId',
                role: 'admin',
            },
        };

        const testRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Define the category
        const category = {
            _id: 'categoryId',
            name: 'Category',
            color: 'color',
        };

        // Mock the Category.findById method to return a category
        category.findById = jest.fn().mockResolvedValue(category);

        // Mock the Category.findByIdAndUpdate method to return the updated category
        category.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedCategory);


        jest.spyOn(Utils, "verifyAuth").mockReturnValue({ authorized: true, cause: "Authorized" })
        jest.spyOn(categories.prototype, "save").mockResolvedValue(category);

        await createCategory(testReq, testRes)
        // Call the controller function
        await updateCategory(testReq, testRes);

        // Verify the expected behavior
        //expect(category.findById).toHaveBeenCalledWith('categoryId');
        //expect(category.findByIdAndUpdate).toHaveBeenCalledWith('categoryId', { new: true });

        expect(testRes.status).toHaveBeenCalledWith(400);
        expect(testRes.json).toHaveBeenCalledWith({ error: "Not enough parameters." });
    });



    test('Category not found', async () => {
        // Mock request and response objects
        const testReq = {
            params: {
                type: 'nonExistingCategoryId',
            },
            body: {
                type: 'Updated Category',
                color: 'updated-color',
            },
        };

        const testRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Mock the verifyAuth function to return true (authorized user)
        verifyAuth.mockReturnValue(true);

        // Mock the categories.findOne method to return null (category not found)
        categories.findOne = jest.fn().mockResolvedValue(null);

        // Call the controller function
        await updateCategory(testReq, testRes);

        // Verify the expected behavior
        expect(categories.findOne).toHaveBeenCalledWith({ type: 'nonExistingCategoryId' });
        expect(testRes.status).toHaveBeenCalledWith(400);
        expect(testRes.json).toHaveBeenCalledWith({ error: "The specified category does not exist or the new category is already existing." });
    });

    test('Unauthorized user', async () => {
        // Mock request and response objects
        const testReq = {
            params: {
                type: 'categoryId',
            },
            body: {
                type: 'Updated Category',
                color: 'updated-color',
            },
        };

        const testRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Mock the verifyAuth function to return false (unauthorized user)
        verifyAuth.mockReturnValue(false);

        // Call the controller function
        await updateCategory(testReq, testRes);

        // Verify the expected behavior
        expect(testRes.status).toHaveBeenCalledWith(401);
        expect(testRes.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    });



    
  test('Updates category successfully v2', async () => {
        const testReq = {
          params: {
            categoryId: "category-id"
          },
          body: {
            type: "new-type",
            color: "#000000"
          }
        };
        const testRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: { refreshTokenMessage: "message" }
        };
        const updatedCategory = {
          _id: "category-id",
          type: "new-type",
          color: "#000000"
        };
    
        jest.spyOn(Utils, "verifyAuth").mockReturnValue({ authorized: true, cause: "Authorized" });
        jest.spyOn(categories, "findOneAndUpdate").mockResolvedValue(updatedCategory);
    
  
        await updateCategory(testReq, testRes);
    
        expect(testRes.status).toHaveBeenCalledWith(200);
        expect(testRes.json).toHaveBeenCalledWith(updatedCategory);
      });
    
})


describe("deleteCategory", () => {
    test('Category does not exist', async () => {
        const testReq = {
            body: {
                types: ["investment", "investment"],
            },
        };

        const testRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "message" },
        };

        const mockCategories = [
            { type: "investment" },
            { type: "investment" },
        ];

        jest.spyOn(Utils, "verifyAuth").mockReturnValue({ authorized: true, cause: "Authorized" });
        jest.spyOn(categories, "find").mockResolvedValue(mockCategories);
        jest.spyOn(categories, "deleteMany").mockResolvedValue({ deletedCount: 1 });
        jest.spyOn(transactions, "updateMany").mockResolvedValue({ modifiedCount: 5 });

        await deleteCategory(testReq, testRes);

        expect(testRes.status).toHaveBeenCalledWith(400);
        expect(testRes.json).toHaveBeenCalledWith({ error: "The specified category does not exist." });
    });


    test('Deletes categories successfully', async () => {
        const testReq = {
            body: {
                types: ["category1", "category2"],
            },
        };

        const testRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: { refreshedTokenMessage: "message" },
        };

        const mockCategories = [
            { type: "category1" },
            { type: "category2" },
        ];

        jest.spyOn(Utils, "verifyAuth").mockReturnValue({ authorized: true, cause: "Authorized" });



    })
    test('Returns 400 if types array is missing or empty', async () => {
        const testReq = {
            cookies: {},
            body: {},
        };

        const testRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        jest.spyOn(Utils, "verifyAuth").mockReturnValue({ authorized: true, cause: "Authorized" });

        await deleteCategory(testReq, testRes);

        expect(testRes.status).toHaveBeenCalledWith(400);
        expect(testRes.json).toHaveBeenCalledWith({ error: "Invalid input array." });
    });

    test('Returns 400 if only one category remains', async () => {
        const testReq = {
            cookies: {},
            body: {
                types: ["category1"],
            },
        };

        const testRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        const mockCategories = [
            { type: "category1" },
        ];

        jest.spyOn(Utils, "verifyAuth").mockReturnValue({ authorized: true, cause: "Authorized" });
        jest.spyOn(categories, "find").mockResolvedValue(mockCategories);

        await deleteCategory(testReq, testRes);

        expect(testRes.status).toHaveBeenCalledWith(400);
        expect(testRes.json).toHaveBeenCalledWith({ error: "You cannot delete the remaining category." });
    });
    
    test('Returns 400 if empty string is found in types array', async () => {
      const testReq = {
        cookies: {},
        body: {
          types: ["category1", ""],
        },
      };
    
      const testRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    
      const mockCategories = [
        { type: "category1" },
        { type: "category2" },
      ];
    
      jest.spyOn(Utils, "verifyAuth").mockReturnValue({ authorized: true, cause: "Authorized" });
      jest.spyOn(categories, "find").mockResolvedValue(mockCategories);
     // jest.replaceProperty(Utils, "checkEmptyParam", jest.fn().mockReturnValue(false));
    
      await deleteCategory(testReq, testRes);
    
      expect(testRes.status).toHaveBeenCalledWith(400);
      expect(testRes.json).toHaveBeenCalledWith({ error: "Empty strings are not allowed." });
    });
 



})


describe("getCategories", () => {
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("createTransaction", () => {
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getAllTransactions", () => {
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByUser", () => {
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByUserByCategory", () => {
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByGroup", () => {
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByGroupByCategory", () => {
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("deleteTransaction", () => {
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("deleteTransactions", () => {
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})



*/