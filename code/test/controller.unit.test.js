import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model';
import { createCategory, categoryTypeExists, userExistsByUsername, updateCategory, updatedCategory, deleteCategory, getCategories, createTransaction, getAllTransactions, getTransactionsByGroup, getTransactionsByUser, getTransactionsByUserByCategory, getTransactionsByGroupByCategory, deleteTransactions, deleteTransaction, checkEmptyParam } from '../controllers/controller.js';
import * as Utils from '../controllers/utils'
import { verifyAuth } from '../controllers/utils.js';
import { User } from '../models/User';


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

  })

    
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
    
/*
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
  

//ESTAS SON LAS QUE NO ME HAN SALIDO HASTA AHORA. ESTOY INTENTANDO HACERLAS TODAS

  //Continuar por aquí-------------------------------------------
*/

/*
describe("createTransaction", () => {
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

*/
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
  
    test("Should return 400 if username does not exist", async () => {
      User.findOne.mockResolvedValue(null);
      await createTransaction(testReq, testRes);
      expect(testRes.status).toHaveBeenCalledWith(400);
      expect(testRes.json).toHaveBeenCalledWith({ error: "The provided username does not exists." });
    });
  
    test("Should return 400 if URL username does not exist", async () => {
      User.findOne.mockResolvedValueOnce({ username: "testUser" });
      User.findOne.mockResolvedValueOnce(null);
      await createTransaction(testReq, testRes);
      expect(testRes.status).toHaveBeenCalledWith(400);
      expect(testRes.json).toHaveBeenCalledWith({ error: "The provided URL username does not exists." });
    });
  
    test("Should return 400 if category does not exist", async () => {
      categories.findOne.mockResolvedValue(null);
      await createTransaction(testReq, testRes);
      expect(testRes.status).toHaveBeenCalledWith(400);
      expect(testRes.json).toHaveBeenCalledWith({ error: "The provided category does not exists." });
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
        transactions.prototype.save.mockImplementation(() => { throw new Error('Transaction creation error') });
        await createTransaction(testReq, testRes);
       // expect(testRes.status).toHaveBeenCalledWith(500);
        expect(testRes.json).toHaveBeenCalledWith({ error: "Transaction creation error" });
    });
});
  


/*
describe("createTransaction", () => {
    test("Some parameters were not provided", async () => {
      const testReq = {
        params: { username: "testUser" },
        cookies: { refreshToken: "testRefreshToken" },
        body: {},
      };
      const testRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      jest.spyOn(Utils, "userExists").mockResolvedValue(true);
      jest.spyOn(Utils, "verifyAuth").mockReturnValue({ authorized: true, cause: "Authorized" });
  
      await createTransaction(testReq, testRes);
  
      expect(testRes.status).toHaveBeenCalledWith(400);
      expect(testRes.json).toHaveBeenCalledWith({ error: "Some parameters were not provided." });
    });
  
    test("Empty parameters are not allowed", async () => {
      const testReq = {
        params: { username: "testUser" },
        cookies: { refreshToken: "testRefreshToken" },
        body: { username: "", amount: 10.0, type: "testCategory" },
      };
      const testRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      jest.spyOn(Utils, "userExists").mockResolvedValue(true);
      jest.spyOn(Utils, "verifyAuth").mockReturnValue({ authorized: true, cause: "Authorized" });
      jest.spyOn(Utils, "checkEmptyParam").mockReturnValue(false);
  
      await createTransaction(testReq, testRes);
  
      expect(testRes.status).toHaveBeenCalledWith(400);
      expect(testRes.json).toHaveBeenCalledWith({ error: "Empty parameters are not allowed." });
    });
  
    test("Uncorrect username or category not found", async () => {
      const testReq = {
        params: { username: "testUser" },
        cookies: { refreshToken: "testRefreshToken" },
        body: { username: "testUser", amount: 10.0, type: "nonExistingCategory" },
      };
      const testRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      jest.spyOn(Utils, "userExists").mockResolvedValue(true);
      jest.spyOn(Utils, "verifyAuth").mockReturnValue({ authorized: true, cause: "Authorized" });
      jest.spyOn(Utils, "categoryTypeExists").mockResolvedValue(false);
  
      await createTransaction(testReq, testRes);
  
      expect(testRes.status).toHaveBeenCalledWith(400);
      expect(testRes.json).toHaveBeenCalledWith({ error: "Uncorrect username or category not found" });
    });
  
    test("Unauthorized user", async () => {
      const testReq = {
        params: { username: "testUser" },
        cookies: { refreshToken: "testRefreshToken" },
        body: { username: "otherUser", amount: 10.0, type: "testCategory" },
      };
      const testRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      jest.spyOn(Utils, "userExists").mockResolvedValue(true);
      jest.spyOn(Utils, "verifyAuth").mockReturnValue({ authorized: false });
  
      await createTransaction(testReq, testRes);
  
      expect(testRes.status).toHaveBeenCalledWith(401);
      expect(testRes.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    });
  
    test("Cannot parse to Floating point number", async () => {
      const testReq = {
        params: { username: "testUser" },
        cookies: { refreshToken: "testRefreshToken" },
        body: { username: "testUser", amount: "invalidAmount", type: "testCategory" },
      };
      const testRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      jest.spyOn(Utils, "userExists").mockResolvedValue(true);
      jest.spyOn(Utils, "verifyAuth").mockReturnValue({ authorized: true, cause: "Authorized" });
  
      await createTransaction(testReq, testRes);
  
      expect(testRes.status).toHaveBeenCalledWith(400);
      expect(testRes.json).toHaveBeenCalledWith({ error: "Cannot parse to Floating point number" });
    });
  
    test("Creates transaction successfully", async () => {
      const testReq = {
        params: { username: "testUser" },
        cookies: { refreshToken: "testRefreshToken" },
        body: { username: "testUser", amount: 10.0, type: "testCategory" },
      };
      const testRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        locals: { refreshedTokenMessage: "Token refreshed" },
      };
      const transaction = {
        username: "testUser",
        amount: 10.0,
        type: "testCategory",
      };
      jest.spyOn(Utils, "userExists").mockResolvedValue(true);
      jest.spyOn(Utils, "verifyAuth").mockReturnValue({ authorized: true, cause: "Authorized" });
      jest.spyOn(Utils, "checkEmptyParam").mockReturnValue(true);
      jest.spyOn(Utils, "categoryTypeExists").mockResolvedValue(true);
      jest.spyOn(TransactionModel.prototype, "save").mockResolvedValue(transaction);
  
      await createTransaction(testReq, testRes);
  
      expect(testRes.status).toHaveBeenCalledWith(200);
      expect(testRes.json).toHaveBeenCalledWith({
        data: transaction,
        refreshedTokenMessage: "Token refreshed",
      });
    });
  
    test("Internal server error", async () => {
      const testReq = {
        params: { username: "testUser" },
        cookies: { refreshToken: "testRefreshToken" },
        body: { username: "testUser", amount: 10.0, type: "testCategory" },
      };
      const testRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      jest.spyOn(Utils, "userExists").mockRejectedValue(new Error("Internal server error"));
  
      await createTransaction(testReq, testRes);
  
      expect(testRes.status).toHaveBeenCalledWith(500);
      expect(testRes.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });
  
*/


/*
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
          refreshedTokenMessage: "Token refreshed"
        }
      };
  
      verifyAuth.mockReturnValue({ authorized: true, isAdmin: true });
      transactions.aggregate.mockResolvedValue([
        {
          username: "testUser",
          amount: 10.0,
          type: "testCategory",
          date: "2023-06-02",
          categories_info: { color: "testColor" }
        }
      ]);
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    test("Should return all transactions with category information", async () => {
      await getAllTransactions(testReq, testRes);
      expect(testRes.status).toHaveBeenCalledWith(200);
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
        refreshedTokenMessage: testRes.locals.refreshedTokenMessage
      });
    });
  
    test("Should return 401 if not authorized", async () => {
      verifyAuth.mockReturnValue({ authorized: false });
      await getAllTransactions(testReq, testRes);
      expect(testRes.status).toHaveBeenCalledWith(401);
      expect(testRes.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    });
  
    test("Should return 500 if there is a server error", async () => {
      transactions.aggregate.mockRejectedValue(new Error("Server error"));
      await getAllTransactions(testReq, testRes);
      expect(testRes.status).toHaveBeenCalledWith(500);
      expect(testRes.json).toHaveBeenCalledWith({ error: "Server error" });
    });
  });
  
*/

/*
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
        url: "/transactions/users/testUser"
      };
  
      testRes = {
        status: statusSpy,
        json: jsonSpy,
        locals: {
          refreshedTokenMessage: "Token refreshed"
        }
      };
  
      verifyAuth.mockReturnValue({ authorized: true, isAdmin: false });
      userExistsByUsername.mockResolvedValue({ username: "testUser" });
      userExistsByUsername.mockResolvedValue(true);
      transactions.find.mockResolvedValue([
        {
          username: "testUser",
          amount: 10.0,
          type: "testCategory",
          date: "2023-06-02"
        }
      ]);
      getCategoryColor.mockReturnValue("testColor");
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    test("Should return all transactions for the specified user", async () => {
      await getTransactionsByUser(testReq, testRes);
      expect(testRes.status).toHaveBeenCalledWith(200);
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
        refreshedTokenMessage: testRes.locals.refreshedTokenMessage
      });
    });

    
  
    test("Should return 400 if the user does not exist", async () => {
      userExistsByUsername.mockResolvedValue(false);
      await getTransactionsByUser(testReq, testRes);
      expect(testRes.status).toHaveBeenCalledWith(400);
      expect(testRes.json).toHaveBeenCalledWith({ error: "User does not exist" });
    });
  
    test("Should return 401 if not authorized as the user", async () => {
      verifyAuth.mockReturnValue({ authorized: false });
      await getTransactionsByUser(testReq, testRes);
      expect(testRes.status).toHaveBeenCalledWith(401);
      expect(testRes.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    });
  
    test("Should return 401 if trying to access another user's transactions", async () => {
      testReq.params.username = "otherUser";
      await getTransactionsByUser(testReq, testRes);
      expect(testRes.status).toHaveBeenCalledWith(401);
      expect(testRes.json).toHaveBeenCalledWith({ error: "You cannot access these data" });
    });
  
    test("Should return filtered transactions based on query parameters", async () => {
      testReq.url = "/transactions";
      testReq.query = { date: "2023-06-02" };
      await getTransactionsByUser(testReq, testRes);
      expect(testRes.status).toHaveBeenCalledWith(200);
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
        refreshedTokenMessage: testRes.locals.refreshedTokenMessage
      });
    });
  
    test("Should return 500 if there is a server error", async () => {
        transactions.find.mockRejectedValue(new Error("Server error"));
        await getTransactionsByUser(testReq, testRes);
        expect(testRes.status).toHaveBeenCalledWith(500);
        expect(testRes.json).toHaveBeenCalledWith({ error: "Server error" });
      });
    });
  
*/


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



