import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model';
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

beforeAll(async () => {
  const dbName = "testingDatabaseController";
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

describe("createCategory", () => { 
    test('Dummy test, change it', () => {
        /*
        Check permissions to create category
        //Show error if no permission 
        Check category and colour doesnt exist
        //Show error if already exists
        // error 401 returned if the specified category does not exist
        //error 401 is returned if new parameters have invalid values
        Create and add new category
        */
        expect(true).toBe(true);
    });
})

describe("updateCategory", () => { 
    test('Dummy test, change it', () => {
        //Check permissions to update category
        //Show error if no permission 
        //Check new category doesnt exist
        //Show error if already exists
        // error 401 returned if the specified category does not exist
        //error 401 is returned if new parameters have invalid values
        //Update the new category
        expect(true).toBe(true);
    });
})

describe("deleteCategory", () => { 
    test('Dummy test, change it', () => {
        //Check permissions to update category
        //Show error if no permission 
        //Delete data of the category
        //Check the category has been deleted
        expect(true).toBe(true);
    });
})

describe("getCategories", () => { 
    test('Dummy test, change it', () => {
        //Check permissions to get category
        //Show error if no permission 
        //Check category exists
        //Error if category doesnt exist
        //Display category
        expect(true).toBe(true);
    });
})

describe("createTransaction", () => { 
    test('Dummy test, change it', () => {
       /*//Check permissions to create Transactions
        //Show error if no permission 
        //Check valid attributes : `username`, `type` and `amount`
        //Check valid attributes `username`, `type`, `amount` and `date`
        //Show error if not valid attributes(error 401 is returned if the username or the type of category does not exist)
    */
        expect(true).toBe(true);
    });
})

describe("getAllTransactions", () => { 
    test('Dummy test, change it', () => {
                expect(true).toBe(true);
        /*
        //Check permissions to get Transactions
        //Show error if no permission 
        //Show error if no transaction
        //Display All type transactions
        
*/
    });
})

describe("getTransactionsByUser", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
        //Check permissions to get Transactions
        //Show error if no permission 
        //Check selected user transactions exist
        //Show error if user transactions doesnt exist
        //Display only user transactions
    });
})

describe("getTransactionsByUserByCategory", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
        //Check permissions to get Transactions
        //Show error if no permission 
        //Check selected category transactions exist
        //Show error if category transactions doesnt exist
        //Display only user transactions
    });
})

describe("getTransactionsByGroup", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
        //Check permissions to get Transactions
        //Show error if no permission 
        //Check selected group transactions exist
        //Show error if group transactions doesnt exist
        //Display only user transactions
    });
})

describe("getTransactionsByGroupByCategory", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
        //Check permissions to get Transactions
        //Show error if no permission 
        //Check selected category and group transactions exist
        //Show error if category and group transactions doesnt exist
        //Display only user transactions
    });
})

describe("deleteTransaction", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
        //Check permissions to delete Transactions
        //Show error if no permission
        //Show error if no transaction
        //Delete only selected transaction

        
    });
})

describe("deleteTransactions", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
          //Check permissions to delete Transactions
        //Show error if no permission
        //Show error if no transaction
        //Delete ALL transactions

    });
})



//STILL MISSING NEW IMPLEMENTED FUNCTIONS TESTS
