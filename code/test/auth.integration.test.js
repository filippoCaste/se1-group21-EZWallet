import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
const bcrypt = require("bcryptjs")
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

beforeAll(async () => {
  const dbName = "testingDatabaseAuth";
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

describe('register', () => {
/*     - error 400 is returned if there is already a user with the same username and/or email
 
  //check email account doesnt exist
  //check username is valid (not yet registered)
  //check valid password (password criterion)
            //Error 400 is returned if there is already a user with the same username and/or email
           //Response `data` Content: A message confirming successful insertion
  //register the new user and display main screen
  */
});

describe("registerAdmin", () => { 
    test('Dummy test, change it', () => {
      //There is only one admin in each family=> check there is not an admin yet
      //If there is already an Admin=> error 400
      //Change role of the user to Admin
        expect(true).toBe(true);
    });
})

describe('login', () => { 
    test('Dummy test, change it', () => {
      //check email exists
      //check password
      //if all valid=> New object with the created accessToken and refreshToken
      //log in and display main screen

        //error 400 is returned if the user does not exist
        //error 400 is returned if the supplied password does not match with the one in the database
        expect(true).toBe(true);
    });
});

describe('logout', () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
        //delete the created accessToken and refreshToken from DB
        // A message confirming successful logout
        //display logIn screen
    });
});

//STILL MISSING NEW IMPLEMENTED FUNCTIONS TESTS
