import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';


jest.mock("bcryptjs");
jest.mock('../models/User.js');
jest.mock('jsonwebtoken');

import { register } from '../controllers/auth.js';
describe('register', () => {
    let mockRequest;
    let mockResponse;
    let statusSpy;
    let jsonSpy;

    beforeEach(() => {
        // Set up the req, res objects before each test
        mockRequest = {
            body: {
                username: "Mario",
                email: "mario.red@email.com",
                password: "securePass"
            }
        };
        statusSpy = jest.fn().mockReturnThis();
        jsonSpy = jest.fn();
        mockResponse = {
            status: statusSpy,
            json: jsonSpy
        };
        bcrypt.hash.mockResolvedValue('hashedPassword');
        User.create.mockResolvedValue({});
        User.findOne.mockResolvedValue(null);
    });

    // Test for successful user registration
    test('should register a new user successfully', async () => {
        await register(mockRequest, mockResponse);
        expect(statusSpy).toHaveBeenCalledWith(200);
        expect(jsonSpy).toHaveBeenCalledWith({ data: { message: "User added successfully" } });
    });

    // Test for incomplete request body
    test('should return 400 error if the request body does not contain all the necessary attributes', async () => {
        mockRequest.body = { username: "Mario" };
        await register(mockRequest, mockResponse);
        expect(statusSpy).toHaveBeenCalledWith(400);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "Incomplete request body" });
    });

    // Test for empty strings
    test('should return 400 error if at least one of the parameters in the request body is an empty string', async () => {
        mockRequest.body = { username: "", email: "mario.red@email.com", password: "securePass" };
        await register(mockRequest, mockResponse);
        expect(statusSpy).toHaveBeenCalledWith(400);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "Empty fields are not allowed" });
    });

    // Test for invalid email format
    test('should return 400 error if the email in the request body is not in a valid email format', async () => {
        mockRequest.body = { username: "Mario", email: "mario.red", password: "securePass" };
        await register(mockRequest, mockResponse);
        expect(statusSpy).toHaveBeenCalledWith(400);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "Invalid email format" });
    });

    // Test for existing username
    test('should return 400 error if the username in the request body identifies an already existing user', async () => {
        User.findOne.mockResolvedValue({ username: "Mario" });
        await register(mockRequest, mockResponse);
        expect(statusSpy).toHaveBeenCalledWith(400);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "Username or email already in use" });
    });

    // Test for existing email
    test('should return 400 error if the email in the request body identifies an already existing user', async () => {
        User.findOne.mockResolvedValue({ email: "mario.red@email.com" });
        await register(mockRequest, mockResponse);
        expect(statusSpy).toHaveBeenCalledWith(400);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "Username or email already in use" });
    });

    // Test for unexpected server error
    test('should return 500 error if there is a server error', async () => {
        User.findOne.mockRejectedValue(new Error('Server error'));
        await register(mockRequest, mockResponse);
        expect(statusSpy).toHaveBeenCalledWith(500);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "Server error" });
    });
});

import { registerAdmin } from '../controllers/auth.js';
describe('registerAdmin', () => {
    let mockRequest;
    let mockResponse;
    let statusSpy;
    let jsonSpy;

    beforeEach(() => {
        // Set up the req, res objects before each test
        mockRequest = {
            body: {
                username: "admin",
                email: "admin@email.com",
                password: "securePass"
            }
        };
        statusSpy = jest.fn().mockReturnThis();
        jsonSpy = jest.fn();
        mockResponse = {
            status: statusSpy,
            json: jsonSpy
        };
        bcrypt.hash.mockResolvedValue('hashedPassword');
        User.create.mockResolvedValue({});
        User.findOne.mockResolvedValue(null);
    });

    // Test for successful admin user registration
    test('should register a new admin user successfully', async () => {
        await registerAdmin(mockRequest, mockResponse);
        expect(statusSpy).toHaveBeenCalledWith(200);
        expect(jsonSpy).toHaveBeenCalledWith({ data: { message: "Admin added successfully" } });
    });

    // Test for incomplete request body
    test('should return 400 error if the request body does not contain all the necessary attributes', async () => {
        mockRequest.body = { username: "admin" };
        await registerAdmin(mockRequest, mockResponse);
        expect(statusSpy).toHaveBeenCalledWith(400);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "Incomplete request body" });
    });

    // Test for empty strings
    test('should return 400 error if at least one of the parameters in the request body is an empty string', async () => {
        mockRequest.body = { username: "", email: "admin@email.com", password: "securePass" };
        await registerAdmin(mockRequest, mockResponse);
        expect(statusSpy).toHaveBeenCalledWith(400);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "Empty fields are not allowed" });
    });

    // Test for invalid email format
    test('should return 400 error if the email in the request body is not in a valid email format', async () => {
        mockRequest.body = { username: "admin", email: "admin", password: "securePass" };
        await registerAdmin(mockRequest, mockResponse);
        expect(statusSpy).toHaveBeenCalledWith(400);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "Invalid email format" });
    });

    // Test for existing username
    test('should return 400 error if the username in the request body identifies an already existing user', async () => {
        User.findOne.mockResolvedValue({ username: "admin" });
        await registerAdmin(mockRequest, mockResponse);
        expect(statusSpy).toHaveBeenCalledWith(400);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "Username or email already in use" });
    });

    // Test for existing email
    test('should return 400 error if the email in the request body identifies an already existing user', async () => {
        User.findOne.mockResolvedValue({ email: "admin@email.com" });
        await registerAdmin(mockRequest, mockResponse);
        expect(statusSpy).toHaveBeenCalledWith(400);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "Username or email already in use" });
    });

    // Test for unexpected server error
    test('should return 500 error if there is a server error', async () => {
        User.findOne.mockRejectedValue(new Error('Server error'));
        await registerAdmin(mockRequest, mockResponse);
        expect(statusSpy).toHaveBeenCalledWith(500);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "Server error" });
    });
});

import { login } from '../controllers/auth.js';
describe('login', () => {
    let mockRequest;
    let mockResponse;
    let statusSpy;
    let jsonSpy;

    beforeEach(() => {
        // Set up the req, res objects before each test
        mockRequest = {
            body: {
                email: "user@email.com",
                password: "securePass"
            },
            cookies: {}
        };
        statusSpy = jest.fn().mockReturnThis();
        jsonSpy = jest.fn();
        mockResponse = {
            status: statusSpy,
            json: jsonSpy,
            cookie: jest.fn()
        };
        bcrypt.compare.mockResolvedValue(true);
        User.findOne.mockResolvedValue({
            email: "user@email.com",
            password: 'hashedPassword',
            save: jest.fn().mockResolvedValue({})
        });
    });

    // Test for successful login
    test('should log in a user successfully', async () => {
        await login(mockRequest, mockResponse);
        expect(statusSpy).toHaveBeenCalledWith(200);
        expect(jsonSpy).toHaveBeenCalled();
    });

    // Test for incomplete request body
    test('should return 400 error if the request body does not contain all the necessary attributes', async () => {
        mockRequest.body = { email: "user@email.com" };
        await login(mockRequest, mockResponse);
        expect(statusSpy).toHaveBeenCalledWith(400);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "Incomplete request body" });
    });

    // Test for empty strings
    test('should return 400 error if at least one of the parameters in the request body is an empty string', async () => {
        mockRequest.body = { email: "", password: "securePass" };
        await login(mockRequest, mockResponse);
        expect(statusSpy).toHaveBeenCalledWith(400);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "Empty fields are not allowed" });
    });

    // Test for invalid email format
    test('should return 400 error if the email in the request body is not in a valid email format', async () => {
        mockRequest.body = { email: "user", password: "securePass" };
        await login(mockRequest, mockResponse);
        expect(statusSpy).toHaveBeenCalledWith(400);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "Invalid email format" });
    });

    // Test for non-existent user
    test('should return 400 error if the email in the request body does not identify a user in the database', async () => {
        User.findOne.mockResolvedValue(null);
        await login(mockRequest, mockResponse);
        expect(statusSpy).toHaveBeenCalledWith(400);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "please you need to register" });
    });

    // Test for incorrect password
    test('should return 400 error if the supplied password does not match with the one in the database', async () => {
        bcrypt.compare.mockResolvedValue(false);
        await login(mockRequest, mockResponse);
        expect(statusSpy).toHaveBeenCalledWith(400);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "wrong credentials" });
    });
// Test for unexpected server error
test('should return 500 error if there is a server error', async () => {
    User.findOne.mockRejectedValue(new Error('Server error'));
  
    await login(mockRequest, mockResponse);
  
    expect(statusSpy).toHaveBeenCalledWith(500);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "Server error" });
  });


});

import { logout } from '../controllers/auth.js';
describe('logout function', () => {
    let mockRequest;
    let mockResponse;
    let statusSpy;
    let jsonSpy;
    let cookieSpy;

    beforeEach(() => {
        // Set up the req, res objects before each test
        mockRequest = {
            cookies: {
                refreshToken: 'refreshToken123'
            }
        };
        statusSpy = jest.fn().mockReturnThis();
        jsonSpy = jest.fn();
        cookieSpy = jest.fn();
        mockResponse = {
            status: statusSpy,
            json: jsonSpy,
            cookie: cookieSpy
        };
        User.findOne.mockResolvedValue({
            refreshToken: 'refreshToken123',
            save: jest.fn().mockResolvedValue({})
        });
    });

    // Test for successful logout
    test('should logout a user successfully', async () => {
        await logout(mockRequest, mockResponse);
        expect(statusSpy).toHaveBeenCalledWith(200);
        expect(jsonSpy).toHaveBeenCalledWith({ data: { message: "User logged out" } });
    });

    // Test for absence of refresh token in the request's cookies
    test('should return 400 error if the request does not have a refresh token in the cookies', async () => {
        mockRequest.cookies = {};
        await logout(mockRequest, mockResponse);
        expect(statusSpy).toHaveBeenCalledWith(400);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "No refresh token provided" });
    });

    // Test for non-existent user in the database
    test('should return 400 error if the refresh token in the request\'s cookies does not represent a user in the database', async () => {
        User.findOne.mockResolvedValue(null);
        await logout(mockRequest, mockResponse);
        expect(statusSpy).toHaveBeenCalledWith(400);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "User not found" });
    });

    // Test for unexpected server error
    test('should return 500 error if there is a server error', async () => {
        User.findOne.mockRejectedValue(new Error('Server error'));
        await logout(mockRequest, mockResponse);
        expect(statusSpy).toHaveBeenCalledWith(500);
        expect(jsonSpy).toHaveBeenCalledWith({ error: "Server error" });
    });
});
