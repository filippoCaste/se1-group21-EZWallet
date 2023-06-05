import { app } from '../app';
import { categories } from '../models/model';
import { transactions } from '../models/model';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Group } from '../models/User';
import jwt from 'jsonwebtoken';
import { handleDateFilterParams, handleAmountFilterParams, verifyAuth, userExistsByUsername } from '../controllers/utils.js';

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

//necessary setup to ensure that each test can insert the data it needs
beforeEach(async () => {
    await categories.deleteMany({})
    await transactions.deleteMany({})
    await User.deleteMany({})
    await Group.deleteMany({})
})

/**
 * Alternate way to create the necessary tokens for authentication without using the website
 */
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

//These tokens can be used in order to test the specific authentication error scenarios inside verifyAuth (no need to have multiple authentication error tests for the same route)
const testerAccessTokenExpired = jwt.sign({
    email: "tester@test.com",
    username: "tester",
    role: "Regular"
}, process.env.ACCESS_KEY, { expiresIn: '0s' })
const testerAccessTokenEmpty = jwt.sign({}, process.env.ACCESS_KEY, { expiresIn: "1y" })

describe("verifyAuth", () => {
    /**
     * When calling verifyAuth directly, we do not have access to the req and res objects created by express, so we must define them manually
     * An object with a "cookies" field that in turn contains "accessToken" and "refreshToken" is sufficient for the request
     * The response object is untouched in most cases, so it can be a simple empty object
     */
    test("Tokens are both valid and belong to the requested user", () => {
        //The only difference between access and refresh token is (in practice) their duration, but the payload is the same
        //Meaning that the same object can be used for both
        const req = { cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid } }
        const res = {}
        //The function is called in the same way as in the various methods, passing the necessary authType and other information
        const response = verifyAuth(req, res, { authType: "User", username: "tester" })
        //The response object must contain a field that is a boolean value equal to true, it does not matter what the actual name of the field is
        //Checks on the "cause" field are omitted since it can be any string
        expect(Object.values(response).includes(true)).toBe(true)
    })

    test("Tokens are both valid and user belongs to the requested group", () => {
        const req = { cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid } }
        const res = {}
        const memberEmails = [
            "fake@polito.it",
            "tester@polito.it",
            "new@polito.it",
            "tester@test.com"
        ]
        const response = verifyAuth(req, res, { authType: "Group", memberEmails: memberEmails })
        expect(Object.values(response).includes(true)).toBe(true)
    })

    test("Tokens are both valid and user does not belong to the requested group", () => {
        const req = { cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid } }
        const res = {}
        const memberEmails = [
            "fake@polito.it",
            "tester@polito.it",
            "new@polito.it"
        ]
        const response = verifyAuth(req, res, { authType: "Group", memberEmails: memberEmails })
        expect(Object.values(response).includes(true)).toBe(false)
    })

    test("Tokens are both valid and belong to the requested admin", () => {
        //The only difference between access and refresh token is (in practice) their duration, but the payload is the same
        //Meaning that the same object can be used for both
        const req = { cookies: { accessToken: adminAccessTokenValid, refreshToken: adminAccessTokenValid } }
        const res = {}
        //The function is called in the same way as in the various methods, passing the necessary authType and other information
        const response = verifyAuth(req, res, { authType: "Admin", username: "admin" })
        //The response object must contain a field that is a boolean value equal to true, it does not matter what the actual name of the field is
        //Checks on the "cause" field are omitted since it can be any string
        expect(Object.values(response).includes(true)).toBe(true)
    })

    test("User tries to access as admin not granted", () => {
        const req = { cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid } }
        const res = {}
        const response = verifyAuth(req, res, { authType: "Admin", username: "tester" })
        expect(Object.values(response).includes(true)).toBe(false)
    })

    test("Admin accesses as simple user", () => {
        const req = { cookies: { accessToken: adminAccessTokenValid, refreshToken: adminAccessTokenValid } }
        const res = {}
        const response = verifyAuth(req, res, { authType: "Simple", username: "admin" })
        expect(Object.values(response).includes(true)).toBe(true)
    })

    test("User accesses as simple user", () => {
        const req = { cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid } }
        const res = {}
        const response = verifyAuth(req, res, { authType: "Simple", username: "tester" })
        expect(Object.values(response).includes(true)).toBe(true)
    })

    test("Undefined tokens", () => {
        const req = { cookies: {} }
        const res = {}
        const response = verifyAuth(req, res, { authType: "Simple" })
        //The test is passed if the function returns an object with a false value, no matter its name
        expect(Object.values(response).includes(false)).toBe(true)
    })

    /**
     * The only situation where the response object is actually interacted with is the case where the access token must be refreshed
     */
    test("Access token expired and refresh token belonging to the requested user", () => {
        const req = { cookies: { accessToken: testerAccessTokenExpired, refreshToken: testerAccessTokenValid } }
        //The inner working of the cookie function is as follows: the response object's cookieArgs object values are set
        const cookieMock = (name, value, options) => {
            res.cookieArgs = { name, value, options };
        }
        //In this case the response object must have a "cookie" function that sets the needed values, as well as a "locals" object where the message must be set 
        const res = {
            cookie: cookieMock,
            locals: {},
        }
        const response = verifyAuth(req, res, { authType: "User", username: "tester" })
        //The response must have a true value (valid refresh token and expired access token)
        expect(Object.values(response).includes(true)).toBe(true)
        expect(res.cookieArgs).toEqual({
            name: 'accessToken', //The cookie arguments must have the name set to "accessToken" (value updated)
            value: expect.any(String), //The actual value is unpredictable (jwt string), so it must exist
            options: { //The same options as during creation
                httpOnly: true,
                path: '/api',
                maxAge: 60 * 60 * 1000,
                sameSite: 'none',
                secure: true,
            },
        })
        //The response object must have a field that contains the message, with the name being either "message" or "refreshedTokenMessage"
        const message = res.locals.refreshedTokenMessage ? true : res.locals.message ? true : false
        expect(message).toBe(true)
    })

    test("Access token and refresh token expired belonging to the requested user", () => {
        const req = { cookies: { accessToken: testerAccessTokenExpired, refreshToken: testerAccessTokenExpired } }
        //The inner working of the cookie function is as follows: the response object's cookieArgs object values are set
        const res = { }
        const response = verifyAuth(req, res, { authType: "User", username: "tester" })
        //The response must have a true value (valid refresh token and expired access token)
        expect(Object.values(response).includes(true)).toBe(false)
    })

})

describe("handleDateFilterParams", () => { 
    it('should handle valid date range and authenticated user', () => {
        const req = {
            cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid }, 
            query: { from: '2022-01-01', upTo: '2022-12-31' }
        }
        const res = {}

        const response = verifyAuth(req, res, { authType: "User", username: "tester" })
        expect(Object.values(response).includes(true)).toBe(true)

        const matchStage = handleDateFilterParams(req);
        const d1 = new Date('2022-01-01T00:00:00.000Z');
        const d2 = new Date('2022-12-31T23:59:59.999Z');
        expect(matchStage.date).toStrictEqual({ "$gte": d1, "$lte": d2 });
    })

    it('should handle valid exact date and authenticated user', () => {
        const req = {
            cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid },
            query: { date: '2023-01-31' }
        }
        const res = {}

        const response = verifyAuth(req, res, { authType: "User", username: "tester" })

        const matchStage = handleDateFilterParams(req);

        const d1 = new Date('2023-01-31T00:00:00.000Z');
        const d2 = new Date('2023-01-31T23:59:59.999Z');
        expect(matchStage.date).toStrictEqual({ "$gte": d1, "$lte": d2 });
    })

    it('should handle invalid from and authenticated user', () => {
        const req = {
            cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid },
            query: { from: '2023-02-29' }
        }
        const res = {}

        const response = verifyAuth(req, res, { authType: "User", username: "tester" })
        expect(Object.values(response).includes(true)).toBe(true)

        expect(() => handleDateFilterParams(req)).toThrow('The string is not a date');
    })

    it('should handle invalid upTo and authenticated user', () => {
        const req = {
            cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid },
            query: { upTo: 'invalid' }
        }
        const res = {}

        const response = verifyAuth(req, res, { authType: "User", username: "tester" })
        expect(Object.values(response).includes(true)).toBe(true)

        expect(() => handleDateFilterParams(req)).toThrow('The string is not a date');
    })

    it('should handle invalid date and authenticated user', () => {
        const req = {
            cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid },
            query: { date: 'invalid' }
        }
        const res = {}

        const response = verifyAuth(req, res, { authType: "User", username: "tester" })
        expect(Object.values(response).includes(true)).toBe(true)

        expect(() => handleDateFilterParams(req)).toThrow('The string is not a date');
    })

    it('should handle invalid date with other param and authenticated user', () => {
        const req = {
            cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid },
            query: { from: '2023-02-09', date: '2023-02-21' }
        }
        const res = {}

        const response = verifyAuth(req, res, { authType: "User", username: "tester" })
        expect(Object.values(response).includes(true)).toBe(true)

        expect(() => handleDateFilterParams(req)).toThrow('Impossible combination');
    })


    it('should handle invalid date range and authenticated user', () => {
        const req = {
            cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid },
            query: { from: '2023-01-31', upTo: '2023-01-22'}
        }
        const res = {}

        const response = verifyAuth(req, res, { authType: "User", username: "tester" })
        expect(Object.values(response).includes(true)).toBe(true)

        expect(() => handleDateFilterParams(req)).toThrow('Impossible combination');
    })

    it('should handle invalid date range (month) and authenticated user', () => {
        const req = {
            cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid },
            query: { from: '2023-02-07', upTo: '2023-01-22' }
        }
        const res = {}

        const response = verifyAuth(req, res, { authType: "User", username: "tester" })
        expect(Object.values(response).includes(true)).toBe(true)

        expect(() => handleDateFilterParams(req)).toThrow('Impossible combination');
    })

    it('should handle invalid date range (year) and authenticated user', () => {
        const req = {
            cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid },
            query: { from: '2023-01-31', upTo: '2022-01-22' }
        }
        const res = {}

        const response = verifyAuth(req, res, { authType: "User", username: "tester" })
        expect(Object.values(response).includes(true)).toBe(true)

        expect(() => handleDateFilterParams(req)).toThrow('Impossible combination');
    })

    it('should handle not enough parameter and authenticated user', () => {
        const req = {
            cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid },
        }
        const res = {}

        const response = verifyAuth(req, res, { authType: "User", username: "tester" })

        const matchStage = handleDateFilterParams(req);

        expect(matchStage).toStrictEqual({ });
    })

    it('should handle empty query parameter and authenticated user', () => {
        const req = {
            cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid },
            query: { }
        }
        const res = {}

        const response = verifyAuth(req, res, { authType: "User", username: "tester" })

        const matchStage = handleDateFilterParams(req);
        expect(matchStage).toStrictEqual({ });
    })


});

describe("handleAmountFilterParams", () => {
    it('should handle valid amount range and authenticated user', () => {
        const req = {
            cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid },
            query: { max: '34500', min: '12000' } // numbers are passed as strings
        }
        const res = {}

        const response = verifyAuth(req, res, { authType: "User", username: "tester" })
        expect(Object.values(response).includes(true)).toBe(true)

        const matchStage = handleAmountFilterParams(req);
        expect(matchStage.amount).toStrictEqual({ "$gte": 12000, "$lte": 34500 });
    })

    it('should handle valid amount value and authenticated user', () => {
        const req = {
            cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid },
            query: { max: '345000' } 
        }
        const res = {}

        const response = verifyAuth(req, res, { authType: "User", username: "tester" })
        expect(Object.values(response).includes(true)).toBe(true)

        const matchStage = handleAmountFilterParams(req);
        expect(matchStage.amount).toStrictEqual({ "$lte": 345000 });
    })


    it('should handle invalid max amount and authenticated user', () => {
        const req = {
            cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid },
            query: { max: 'this is a string' }
        }
        const res = {}

        const response = verifyAuth(req, res, { authType: "User", username: "tester" })
        expect(Object.values(response).includes(true)).toBe(true)

        expect(() => handleAmountFilterParams(req)).toThrow('The input is not a number');
    })

    it('should handle invalid min amount and authenticated user', () => {
        const req = {
            cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid },
            query: { min: 'this is a string' }
        }
        const res = {}

        const response = verifyAuth(req, res, { authType: "User", username: "tester" })
        expect(Object.values(response).includes(true)).toBe(true)

        expect(() => handleAmountFilterParams(req)).toThrow('The input is not a number');
    })


    it('should handle invalid amount range and authenticated user', () => {
        const req = {
            cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid },
            query: { max: '200', min: '20000' }
        }
        const res = {}

        const response = verifyAuth(req, res, { authType: "User", username: "tester" })
        expect(Object.values(response).includes(true)).toBe(true)

        expect(() => handleAmountFilterParams(req)).toThrow('Impossible combination');
    })

    it('should handle empty input and authenticated user', () => {
        const req = {
            cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid },
            query: {  }
        }
        const res = {}

        const response = verifyAuth(req, res, { authType: "User", username: "tester" })
        expect(Object.values(response).includes(true)).toBe(true)

        const matchStage = handleAmountFilterParams(req);
        expect(matchStage).toStrictEqual({ });
    })

    it('should handle invalid input and authenticated user', () => {
        const req = {
            cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid },
        }
        const res = {}

        const response = verifyAuth(req, res, { authType: "User", username: "tester" })
        expect(Object.values(response).includes(true)).toBe(true)

        const matchStage = handleAmountFilterParams(req);
        expect(matchStage).toStrictEqual({ });
    })



});
