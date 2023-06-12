import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model';
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';
import "jest-extended"
import { User, Group } from '../models/User';
import jwt from 'jsonwebtoken';

dotenv.config();

beforeAll(async () => {
  const dbName = "testingDatabaseController";
  const url = `${process.env.MONGO_URI}/${dbName}`;

  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

});

//necessary setup to ensure that each test can insert the data it needs
beforeEach(async () => {
    await categories.deleteMany({})
    await transactions.deleteMany({})
    await User.deleteMany({})
    await Group.deleteMany({})
})

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

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
const testerAccessTokenEmpty = jwt.sign({}, process.env.ACCESS_KEY, { expiresIn: "1y" })

describe("createCategory", () => { 
            /*
        Check permissions to create category
        //Show error if no permission 
        Check category and colour doesnt exist
        //Show error if already exists
        // error 401 returned if the specified category does not exist
        //error 401 is returned if new parameters have invalid values
        Create and add new category
        */

    test('createCategory: returns status 200 if admin creates a new category', (done) => {
        categories.create({
            type: "food",
            color: "green"
        }).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }]).then(() => {
                    request(app)
                        .post("/api/categories") //Route to call
                        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
                        .send({ type: "health", color: "red" }) //Definition of the request body
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(200)
                            expect(response.body.data).toHaveProperty("type")
                            expect(response.body.data).toHaveProperty("color")

                            //Must be called at the end of every test or the test will fail while waiting for it to be called
                            done()
                        })
                })
            })
        })
    });

    test('createCategory: returns status 401 if user tries to create a new category', (done) => {
        categories.create({
            type: "food",
            color: "red"
        }).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }]).then(() => {
                    request(app)
                        .post("/api/categories") //Route to call
                        .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
                        .send({ type: "health", color: "red" }) //Definition of the request body
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(401)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    test('createCategory: returns status 400 if some parameters are not provided', (done) => {
        categories.create({
            type: "food",
            color: "red"
        }).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }]).then(() => {
                    request(app)
                        .post("/api/categories") //Route to call
                        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
                        .send({ color: "red" }) //Definition of the request body
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    test('createCategory: returns status 400 if some parameters are empty', (done) => {
        categories.create({
            type: "food",
            color: "red"
        }).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }]).then(() => {
                    request(app)
                        .post("/api/categories") //Route to call
                        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
                        .send({ type:"health", color: "" }) //Definition of the request body
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)

                            done()
                        })
                })
            })
        })
    });


    test('createCategory: returns status 400 if the type of category passed in the request body represents an already existing category in the database', (done) => {
        categories.create({
            type: "food",
            color: "red"
        }).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }]).then(() => {
                    request(app)
                        .post("/api/categories") //Route to call
                        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
                        .send({ type: "food", color: "grey" }) //Definition of the request body
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)

                            done()
                        })
                })
            })
        })
    });

})

describe("updateCategory", () => { 
    test("updateCategory: Returns a message for confirmation and the number of updated transactions", (done) => {
        //We create a category in our empty database (we know it's empty thanks to the beforeEach above)
        categories.create({
            type: "food",
            color: "red"
        }).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }]).then(() => {
                    request(app)
                        .patch("/api/categories/food") //Route to call
                        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
                        .send({ type: "health", color: "red" }) //Definition of the request body
                        .then((response) => { //After obtaining the response, we check its actual body content
                            //The status must represent successful execution
                            expect(response.status).toBe(200)
                            //The "data" object must have a field named "message" that confirms that changes are successful
                            //The actual value of the field could be any string, so it's not checked
                            expect(response.body.data).toHaveProperty("message")
                            //We expect the count of edited transactions returned to be equal to 2 (the two transactions we placed in the database)
                            expect(response.body.data).toHaveProperty("count", 2)

                            //Must be called at the end of every test or the test will fail while waiting for it to be called
                            done()
                        })
                })
            })
        })
    })

    /**
     * The same test as the one above, written using "async/await" instead of "done"
     * The two modes are equivalent, so it does not matter which one is used
     * The most important part is to correctly wait for all Promises (database operations, bcrypt) to end before proceeding with
     *      - awaiting each call, eventually assigning the result to a variable
     *      - calling "then" right after each call
     */
    // test("updateCategory: Returns a message for confirmation and the number of updated transactions", async () => {
    //     await categories.create({ type: "food", color: "red" })
    //     await User.insertMany([{
    //         username: "tester",
    //         email: "tester@test.com",
    //         password: "tester",
    //         refreshToken: testerAccessTokenValid
    //     }, {
    //         username: "admin",
    //         email: "admin@email.com",
    //         password: "admin",
    //         refreshToken: adminAccessTokenValid,
    //         role: "Admin"
    //     }])
    //     await transactions.insertMany([{
    //         username: "tester",
    //         type: "food",
    //         amount: 20
    //     }, {
    //         username: "tester",
    //         type: "food",
    //         amount: 100
    //     }])
    //     //The API request must be awaited as well
    //     const response = await request(app)
    //         .patch("/api/categories/food") //Route to call
    //         .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
    //         .send({ type: "health", color: "red" })

    //     expect(response.status).toBe(200)
    //     expect(response.body.data).toHaveProperty("message")
    //     expect(response.body.data).toHaveProperty("count", 2)
    //     //there is no "done" in this case to signal that the test has ended, as it ends automatically since it's not inside a "then" block
    // })

    test("updateCategory: Returns a 400 error if the type of the new category is the same as one that exists already and that category is not the requested one", (done) => {
        categories.insertMany([{
            type: "food",
            color: "red"
        }, {
            type: "health",
            color: "blue"
        }]).then(() => {
            User.create({
                username: "admin",
                email: "admin@email.com",
                password: "admin",
                refreshToken: adminAccessTokenValid,
                role: "Admin"
            }).then(() => {
                request(app)
                    .patch("/api/categories/food")
                    .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`)
                    .send({ type: "health", color: "green" }) //The passed type is one that already exists and is not the same one in the route (we are not updating the color of a category but we are trying to change its type to be a duplicate => error scenario)
                    .then((response) => {
                        //The response status must signal a wrong request
                        expect(response.status).toBe(400)
                        //The response body must contain a field named either "error" or "message" (both names are accepted but at least one must be present)
                        const errorMessage = response.body.error ? true : response.body.message ? true : false
                        //The test passes if the response body contains at least one of the two fields
                        expect(errorMessage).toBe(true)
                        done()
                    })
            })
        })
    })

    test("updateCategory: Returns a 400 error  if at least one of the parameters in the request body is an empty string", (done) => {
        categories.insertMany([{
            type: "food",
            color: "red"
        }, {
            type: "health",
            color: "blue"
        }]).then(() => {
            User.create({
                username: "admin",
                email: "admin@email.com",
                password: "admin",
                refreshToken: adminAccessTokenValid,
                role: "Admin"
            }).then(() => {
                request(app)
                    .patch("/api/categories/food")
                    .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`)
                    .send({ type: "health", color: "" }) //The passed type is one that already exists and is not the same one in the route (we are not updating the color of a category but we are trying to change its type to be a duplicate => error scenario)
                    .then((response) => {
                        //The response status must signal a wrong request
                        expect(response.status).toBe(400)
                        //The response body must contain a field named either "error" or "message" (both names are accepted but at least one must be present)
                        const errorMessage = response.body.error ? true : response.body.message ? true : false
                        //The test passes if the response body contains at least one of the two fields
                        expect(errorMessage).toBe(true)
                        done()
                    })
            })
        })
    })

    test("updateCategory: Returns a 400 error if the type of category passed as a route parameter does not represent a category in the databas", (done) => {
        categories.insertMany([{
            type: "food",
            color: "red"
        }, {
            type: "health",
            color: "blue"
        }]).then(() => {
            User.create({
                username: "admin",
                email: "admin@email.com",
                password: "admin",
                refreshToken: adminAccessTokenValid,
                role: "Admin"
            }).then(() => {
                request(app)
                    .patch("/api/categories/home")
                    .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`)
                    .send({ type: "home", color: "green" }) //The passed type is one that already exists and is not the same one in the route (we are not updating the color of a category but we are trying to change its type to be a duplicate => error scenario)
                    .then((response) => {
                        //The response status must signal a wrong request
                        expect(response.status).toBe(400)
                        //The response body must contain a field named either "error" or "message" (both names are accepted but at least one must be present)
                        const errorMessage = response.body.error ? true : response.body.message ? true : false
                        //The test passes if the response body contains at least one of the two fields
                        expect(errorMessage).toBe(true)
                        done()
                    })
            })
        })
    })


    test("updateCategory: Returns a 400 error if the request body does not contain all the necessary parameters", (done) => {
        categories.create({
            type: "food",
            color: "red"
        }).then(() => {
            User.create({
                username: "admin",
                email: "admin@email.com",
                password: "admin",
                refreshToken: adminAccessTokenValid,
                role: "Admin"
            }).then(() => {
                request(app)
                    .patch("/api/categories/food")
                    .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`)
                    //The ".send()" block is missing, meaning that the request body will be empty
                    //Appending ".send({}) leads to the same scenario, so both options are equivalent"
                    .then((response) => {
                        expect(response.status).toBe(400)
                        const errorMessage = response.body.error ? true : response.body.message ? true : false
                        expect(errorMessage).toBe(true)
                        done()
                    })
            })
        })
    })

    test("updateCategory: Returns a 401 error if called by a user who is not an Admin", (done) => {
        categories.create({
            type: "food",
            color: "red"
        }).then(() => {
            User.insertMany([{
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
            }]).then(() => {
                request(app)
                    .patch("/api/categories/food")
                    //The cookies we set are those of a regular user, which will cause the verifyAuth check to fail
                    //Other combinations that can cause the authentication check to fail are also accepted:
                    //      - mismatched tokens: .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${testerAccessTokenValid}`)
                    //      - empty tokens: .set("Cookie", `accessToken=${testerAccessTokenEmpty}; refreshToken=${testerAccessTokenEmpty}`)
                    //      - expired tokens: .set("Cookie", `accessToken=${testerAccessTokenExpired}; refreshToken=${testerAccessTokenExpired}`)
                    //      - missing tokens: .set("Cookie", `accessToken=${}; refreshToken=${}`) (not calling ".set()" at all also works)
                    //Testing just one authentication failure case is enough, there is NO NEED to check all possible token combination for each function
                    .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`)
                    .send({ type: "food", color: "green" })
                    .then((response) => {
                        expect(response.status).toBe(401)
                        const errorMessage = response.body.error ? true : response.body.message ? true : false
                        expect(errorMessage).toBe(true)
                        done()
                    })
            })
        })
    })
})

describe("deleteCategory", () => { 

    test('deleteCategory: returns status 200 if category is successfully deleted', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }, {
            type: "home",
            color: "green"
        }
    ]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }, {
                    username: "admin",
                    type: "home",
                    amount: 10
                }
            ]).then(() => {
                    request(app)
                        .delete("/api/categories") //Route to call
                        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
                        .send({ types: ["drinks", "food"]}) //Definition of the request body
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(200)
                            expect(response.body.data).toHaveProperty("message")
                            expect(response.body.data).toHaveProperty("count", 3);

                            done()
                        })
                })
            })
        })
    });

    test('deleteCategory: returns status 400 if the request body does not contain all the necessary attributes', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }
        ]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }
                ]).then(() => {
                    request(app)
                        .delete("/api/categories") //Route to call
                        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
                        .send({  }) //Definition of the request body
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    test('deleteCategory: returns status 400  if called when there is only one category in the database', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }
        ]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }
                ]).then(() => {
                    request(app)
                        .delete("/api/categories") //Route to call
                        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
                        .send({types: ["food"]}) //Definition of the request body
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    test('deleteCategory: returns status 400  if at least one of the types in the array is an empty string', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }
        ]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }
                ]).then(() => {
                    request(app)
                        .delete("/api/categories") //Route to call
                        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
                        .send({types: ["", "drinks"]}) //Definition of the request body
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    test('deleteCategory: returns status 400 if the array passed in the request body is empty', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }
        ]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }
                ]).then(() => {
                    request(app)
                        .delete("/api/categories") //Route to call
                        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
                        .send({ types: [] }) //Definition of the request body
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    test('deleteCategory: returns status 400 if at least one of the types in the array does not represent a category in the database', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }
        ]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }
                ]).then(() => {
                    request(app)
                        .delete("/api/categories") //Route to call
                        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
                        .send({ types: ["food", "drinks", "i do not exist"] }) //Definition of the request body
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    test('deleteCategory: returns status 401 if called by an authenticated user who is not an admin', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }, {
            type: "home",
            color: "green"
        }
        ]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }, {
                    username: "admin",
                    type: "home",
                    amount: 10
                }
                ]).then(() => {
                    request(app)
                        .delete("/api/categories") //Route to call
                        .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
                        .send({ types: ["drinks", "food"] }) //Definition of the request body
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(401)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });
})

describe("getCategories", () => { 
    test('getCategories: returns status 200 if okay - user', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }, {
            type: "home",
            color: "green"
        }
        ]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }, {
                    username: "admin",
                    type: "home",
                    amount: 10
                }
                ]).then(() => {
                    request(app)
                        .get("/api/categories") //Route to call
                        .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(200)
                            // expect data to have?
                            done()
                        })
                })
            })
        })
    });

    test('getCategories: returns status 200 if okay - admin', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }, {
            type: "home",
            color: "green"
        }
        ]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }, {
                    username: "admin",
                    type: "home",
                    amount: 10
                }
                ]).then(() => {
                    request(app)
                        .get("/api/categories") //Route to call
                        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(200)
                            // expect data to have?
                            done()
                        })
                })
            })
        })
    });

    test('getCategories: returns status 401 if user is not authenticated', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .get("/api/categories") //Route to call
                        .set("Cookie", `accessToken=${testerAccessTokenExpired}; refreshToken=${testerAccessTokenExpired}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(401)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });
})

describe("createTransaction", () => { 
    test('createTransaction: returns status 200 if okay - user', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }, {
            type: "home",
            color: "green"
        }
        ]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }, {
                    username: "admin",
                    type: "home",
                    amount: 10
                }
                ]).then(() => {
                    request(app)
                        .post("/api/users/tester/transactions") //Route to call
                        .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
                        .send({ username: "tester", amount: 999, type: "food" })
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(200)
                            // expect data to have?
                            done()
                        })
                })
            })
        })
    });

    test('createTransaction: returns status 200 if okay - user - negative', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }, {
            type: "home",
            color: "green"
        }
        ]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }, {
                    username: "admin",
                    type: "home",
                    amount: 10
                }
                ]).then(() => {
                    request(app)
                        .post("/api/users/tester/transactions") //Route to call
                        .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
                        .send({ username: "tester", amount: -999, type: "food" })
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(200)
                            // expect data to have?
                            done()
                        })
                })
            })
        })
    });


    test('createTransaction: returns status 200 if okay - admin', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }, {
            type: "home",
            color: "green"
        }
        ]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }, {
                    username: "admin",
                    type: "home",
                    amount: 10
                }
                ]).then(() => {
                    request(app)
                        .post("/api/users/admin/transactions") //Route to call
                        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
                        .send({ username: "admin", amount: 999, type: "home" })
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(200)
                            // expect data to have?
                            done()
                        })
                })
            })
        })
    });

    test('createTransaction: returns status 400 if the request body does not contain all the necessary attributes', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .post("/api/users/tester/transactions") //Route to call
                        .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
                        .send({ username: "tester", type: "food" })
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    test('createTransaction: returns status 400 if at least one of the parameters in the request body is an empty string', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .post("/api/users/tester/transactions") //Route to call
                        .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
                        .send({ username: "tester", amount: 999, type: "" })
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    test('createTransaction: returns status 400 if the type of category passed in the request body does not represent a category in the database', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .post("/api/users/tester/transactions") //Route to call
                        .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
                        .send({ username: "tester", amount: 999, type: "plants" })
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    test('createTransaction: returns status 400 if the username passed in the request body is not equal to the one passed as a route parameter', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .post("/api/users/admin/transactions") //Route to call
                        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
                        .send({ username: "tester", amount: 999, type: "drinks" })
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    test('createTransaction: returns status 400 if the username passed in the request body does not represent a user in the database', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .post("/api/users/admin/transactions") //Route to call
                        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
                        .send({ username: "Ghost", amount: 999, type: "food" })
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    test('createTransaction: returns status 400 if the username passed as a route parameter does not represent a user in the database', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
                username: "admin",
                email: "admin@email.com",
                password: "admin",
                refreshToken: adminAccessTokenValid,
                role: "Admin"
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .post("/api/users/tester/transactions") //Route to call
                        .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
                        .send({ username: "tester", amount: 999, type: "food" })
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    // test('createTransaction: returns status 400 if the amount passed in the request body cannot be parsed as a floating value (negative numbers are accepted)', (done) => {
    //     categories.create([{
    //         type: "food",
    //         color: "red"
    //     }, {
    //         type: "drinks",
    //         color: "blue"
    //     }]).then(() => {
    //         //We insert two users in the datbase: an Admin and a user that made two transactions
    //         User.insertMany([{
    //             username: "tester",
    //             email: "tester@test.com",
    //             password: "tester",
    //             refreshToken: testerAccessTokenValid
    //         }, {
    //             username: "admin",
    //             email: "admin@email.com",
    //             password: "admin",
    //             refreshToken: adminAccessTokenValid,
    //             role: "Admin"
    //         }]).then(() => {
    //             //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
    //             transactions.insertMany([{
    //                 username: "tester",
    //                 type: "food",
    //                 amount: 20
    //             }, {
    //                 username: "tester",
    //                 type: "food",
    //                 amount: 100
    //             }, {
    //                 username: "admin",
    //                 type: "drinks",
    //                 amount: 10000
    //             }]).then(() => {
    //                 request(app)
    //                     .post("/api/users/admin/transactions") //Route to call
    //                     .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
    //                     .send({ username: "admin", amount: , type: "drinks" })
    //                     .then((response) => { //After obtaining the response, we check its actual body content
    //                         expect(response.status).toBe(400)
    //                         const errorMessage = response.body.error ? true : response.body.message ? true : false
    //                         expect(errorMessage).toBe(true)
    //                         done()
    //                     })
    //             })
    //         })
    //     })
    // });


    test('createTransaction: returns status 401 if user is not authenticated', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .post("/api/users/tester/transactions") //Route to call
                        .set("Cookie", `accessToken=${testerAccessTokenExpired}; refreshToken=${testerAccessTokenExpired}`) //Setting cookies in the request
                        .send({ username: "tester", amount: 999, type: "food" })
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(401)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    test('createTransaction: returns status 401 if user is not authenticated', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .post("/api/users/admin/transactions") //Route to call
                        .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
                        .send({ username: "tester", amount: 999, type: "food" })
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(401)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });


})

describe("getAllTransactions", () => { 

    test('getAllTransactions: returns status 200 if okay', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .get("/api/transactions") //Route to call
                        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(200)
                            done()
                        })
                })
            })
        })
    });

    test('getAllTransactions: returns status 401 if user is not admin', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .get("/api/users/admin/transactions") //Route to call
                        .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(401)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });
})

describe("getTransactionsByUser", () => { 

    test('getTransactionsByUser: returns status 200 if okay - admin route', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .get("/api/transactions/users/tester") //Route to call
                        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(200)
                            expect(response.body.data.length).toBe(2);
                            done()
                        })
                })
            })
        })
    });

    test('getTransactionsByUser: returns status 400 if user dooes not exist - admin route', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
                username: "admin",
                email: "admin@email.com",
                password: "admin",
                refreshToken: adminAccessTokenValid,
                role: "Admin"
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .get("/api/transactions/users/tester") //Route to call
                        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    test('getTransactionsByUser: returns status 200 if okay - user route', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .get("/api/users/tester/transactions") //Route to call
                        .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(200)
                            expect(response.body.data.length).toBe(2);
                            done()
                        })
                })
            })
        })
    });

    test('getTransactionsByUser: returns status 200 if okay - user route', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .get("/api/users/tester/transactions?max=50") //Route to call
                        .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(200)
                            expect(response.body.data.length).toBe(1);
                            done()
                        })
                })
            })
        })
    });

    test('getTransactionsByUser: returns status 400 if user dooes not exist - user route', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
                username: "admin",
                email: "admin@email.com",
                password: "admin",
                refreshToken: adminAccessTokenValid,
                role: "Admin"
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .get("/api/users/tester/transactions") //Route to call
                        .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });


    test('getTransactionsByUser: returns status 401 if user is not admin', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .get("/api/transactions/users/tester") //Route to call
                        .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(401)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    test('getTransactionsByUser: returns status 401 if user is not the same as the one provided in the route', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
                }, {
                    username: "new",
                    email: "new@email.com",
                    password: "new",
                    refreshToken: adminAccessTokenValid,
                }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .get("/api/users/tester/transactions") //Route to call
                        .set("Cookie", `accessToken=${newAccessTokenValid}; refreshToken=${newAccessTokenValid}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(401)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });
})

describe("getTransactionsByUserByCategory", () => { 

    test('getTransactionsByUserByCategory: returns status 200 if okay - user route', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }, {
                username: "new",
                email: "new@email.com",
                password: "new",
                refreshToken: newAccessTokenValid
,
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .get("/api/users/tester/transactions/category/food") //Route to call
                        .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(200)
                            expect(response.body.data.length).toBe(2);
                            done()
                        })
                })
            })
        })
    });

    test('getTransactionsByUserByCategory: returns status 200 if okay - admin route', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }, {
                username: "new",
                email: "new@email.com",
                password: "new",
                refreshToken: newAccessTokenValid
,
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .get("/api/transactions/users/tester/category/food") //Route to call
                        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(200)
                            expect(response.body.data.length).toBe(2);
                            done()
                        })
                })
            })
        })
    });

    test('getTransactionsByUserByCategory: returns status 401 if user is not admin - admin route', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
                username: "admin",
                email: "admin@email.com",
                password: "admin",
                refreshToken: adminAccessTokenValid,
                role: "Admin"
            }, {
                username: "new",
                email: "new@email.com",
                password: "new",
                refreshToken: newAccessTokenValid,
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .get("/api/transactions/users/tester/category/food") //Route to call
                        .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(401)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    test('getTransactionsByUserByCategory: returns status 400 if cateogry does not exist - admin route', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }, {
                username: "new",
                email: "new@email.com",
                password: "new",
                refreshToken: newAccessTokenValid
,
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .get("/api/transactions/users/tester/category/unreal") //Route to call
                        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    test('getTransactionsByUserByCategory: returns status 400 if user is not existing - admin route', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
                username: "new",
                email: "new@email.com",
                password: "new",
                refreshToken: newAccessTokenValid,
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .get("/api/transactions/users/admin/category/food") //Route to call
                        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    test('getTransactionsByUserByCategory: returns status 400 if category does not exist - user route', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }, {
                username: "new",
                email: "new@email.com",
                password: "new",
                refreshToken: newAccessTokenValid

            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .get("/api/users/tester/transactions/category/unreal") //Route to call
                        .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    test('getTransactionsByUserByCategory: returns status 401 if user is not the same as the one provided in the route - user', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }, {
                username: "new",
                email: "new@email.com",
                password: "new",
                refreshToken: newAccessTokenValid,
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .get("/api/users/tester/transactions/category/food") //Route to call
                        .set("Cookie", `accessToken=${newAccessTokenValid}; refreshToken=${newAccessTokenValid}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(401)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });
})

describe("getTransactionsByGroup", () => { 

    test('getTransactionsByGroup: returns status 200 if is okay - admin route', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }, {
                username: "new",
                email: "new@email.com",
                password: "new",
                refreshToken: newAccessTokenValid,
            }]).then(() => {
                Group.insertMany([{
                    name: "Family",
                    members: [
                        {email: "tester@test.com"},
                        {email: "new@email.com"}]
                }])

            }).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "new",
                    type: "food",
                    amount: 10
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .get("/api/transactions/groups/Family") //Route to call
                        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(200)
                            expect(response.body.data.length).toBe(3)
                            done()
                        })
                })
            })
        })
    });


    test('getTransactionsByGroup: returns status 200 if okay - user route', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }, {
                username: "new",
                email: "new@email.com",
                password: "new",
                refreshToken: newAccessTokenValid,
            }]).then(() => {
                Group.insertMany([{
                    name: "Family",
                    members: [
                        { email: "tester@test.com" },
                        { email: "new@email.com" }]
                }])
            }).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .get("/api/groups/Family/transactions") //Route to call
                        .set("Cookie", `accessToken=${newAccessTokenValid}; refreshToken=${newAccessTokenValid}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(200)
                            done()
                        })
                })
            })
        })
    });

    test('getTransactionsByGroup: returns status 401 if user is not in the group - user route', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }, {
                username: "new",
                email: "new@email.com",
                password: "new",
                refreshToken: newAccessTokenValid
            }]).then(() => {
                Group.insertMany([{
                    name: "Family",
                    members: [
                        { email: "tester@test.com" }
                    ]
                }])

            }).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .get("/api/groups/Family/transactions") //Route to call
                        .set("Cookie", `accessToken=${newAccessTokenValid}; refreshToken=${newAccessTokenValid}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(401)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    test('getTransactionsByGroup: returns status 401 if user is not admin - admin route', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }, {
                username: "new",
                email: "new@email.com",
                password: "new",
                refreshToken: newAccessTokenValid
            }]).then(() => {
                Group.insertMany([{
                    name: "Family",
                    members: [
                        { email: "tester@test.com" },
                        { email: "new@email.com" }]
                }])

            }).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .get("/api/transactions/groups/Family") //Route to call
                        .set("Cookie", `accessToken=${newAccessTokenValid}; refreshToken=${newAccessTokenValid}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(401)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    test('getTransactionsByGroup: returns status 400 if the group name passed as a route parameter does not represent a group in the database - admin route', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }, {
                username: "new",
                email: "new@email.com",
                password: "new",
                refreshToken: newAccessTokenValid
            }]).then(() => {
                Group.insertMany([{
                    name: "Family",
                    members: [
                        { email: "tester@test.com" },
                        { email: "new@email.com" }]
                }])

            }).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .get("/api/transactions/groups/Fake") //Route to call
                        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    test('getTransactionsByGroup: returns status 400 if the group name passed as a route parameter does not represent a group in the database - user route', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }, {
                username: "new",
                email: "new@email.com",
                password: "new",
                refreshToken: newAccessTokenValid
            }]).then(() => {
                Group.insertMany([{
                    name: "Family",
                    members: [
                        { email: "tester@test.com" },
                        { email: "new@email.com" }]
                }])

            }).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .get("/api/groups/Fake/transactions") //Route to call
                        .set("Cookie", `accessToken=${newAccessTokenValid}; refreshToken=${newAccessTokenValid}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

})

describe("getTransactionsByGroupByCategory", () => { 

    test('getTransactionsByGroupByCategory: returns status 200 if okay - admin route', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }, {
                username: "new",
                email: "new@email.com",
                password: "new",
                refreshToken: newAccessTokenValid
            }]).then(() => {
                Group.insertMany([{
                    name: "Family",
                    members: [
                        { email: "tester@test.com" },
                        { email: "new@email.com" }]
                }])

            }).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .get("/api/transactions/groups/Family/category/food") //Route to call
                        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(200)
                            expect(response.body.data.length).toBe(2)
                            done()
                        })
                })
            })
        })
    });

    test('getTransactionsByGroupByCategory: returns status 200 if okay - user route', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }, {
                username: "new",
                email: "new@email.com",
                password: "new",
                refreshToken: newAccessTokenValid
            }]).then(() => {
                Group.insertMany([{
                    name: "Family",
                    members: [
                        { email: "tester@test.com" },
                        { email: "new@email.com" }]
                }])

            }).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .get("/api/groups/Family/transactions/category/food") //Route to call
                        .set("Cookie", `accessToken=${newAccessTokenValid}; refreshToken=${newAccessTokenValid}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(200)
                            expect(response.body.data.length).toBe(2)
                            done()
                        })
                })
            })
        })
    });


    test('getTransactionsByGroupByCategory: returns status 401 if user is not an admin - admin route', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }, {
                username: "new",
                email: "new@email.com",
                password: "new",
                refreshToken: newAccessTokenValid
            }]).then(() => {
                Group.insertMany([{
                    name: "Family",
                    members: [
                        { email: "tester@test.com" },
                        { email: "new@email.com" }]
                }])

            }).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .get("/api/transactions/groups/Family/category/food") //Route to call
                        .set("Cookie", `accessToken=${newAccessTokenValid}; refreshToken=${newAccessTokenValid}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(401)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    test('getTransactionsByGroupByCategory: returns status 401 if called by an authenticated user who is not part of the group- user route', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }, {
                username: "new",
                email: "new@email.com",
                password: "new",
                refreshToken: newAccessTokenValid
            }]).then(() => {
                Group.insertMany([{
                    name: "Family",
                    members: [
                        { email: "tester@test.com" }
                    ]
                }])

            }).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .get("/api/groups/Family/transactions/category/food") //Route to call
                        .set("Cookie", `accessToken=${newAccessTokenValid}; refreshToken=${newAccessTokenValid}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(401)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });


    test('getTransactionsByGroupByCategory: returns status 400 if the group name passed as a route parameter does not represent a group in the database - admin route', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }, {
                username: "new",
                email: "new@email.com",
                password: "new",
                refreshToken: newAccessTokenValid
            }]).then(() => {
                Group.insertMany([{
                    name: "Family",
                    members: [
                        { email: "tester@test.com" },
                        { email: "new@email.com" }]
                }])

            }).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .get("/api/transactions/groups/Fake/category/food") //Route to call
                        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    test('getTransactionsByGroupByCategory: returns status 400 if the group name passed as a route parameter does not represent a group in the database - user route', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }, {
                username: "new",
                email: "new@email.com",
                password: "new",
                refreshToken: newAccessTokenValid
            }]).then(() => {
                Group.insertMany([{
                    name: "Family",
                    members: [
                        { email: "tester@test.com" },
                        { email: "new@email.com" }]
                }])

            }).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .get("/api/groups/Fake/transactions/category/food") //Route to call
                        .set("Cookie", `accessToken=${newAccessTokenValid}; refreshToken=${newAccessTokenValid}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    test('getTransactionsByGroupByCategory: returns status 400 if category does not exist - admin route', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }, {
                username: "new",
                email: "new@email.com",
                password: "new",
                refreshToken: newAccessTokenValid
            }]).then(() => {
                Group.insertMany([{
                    name: "Family",
                    members: [
                        { email: "tester@test.com" },
                        { email: "new@email.com" }]
                }])

            }).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .get("/api/transactions/groups/Family/category/amazon") //Route to call
                        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    test('getTransactionsByGroupByCategory: returns status 400 if category is not in the database - user route', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }, {
                username: "new",
                email: "new@email.com",
                password: "new",
                refreshToken: newAccessTokenValid
            }]).then(() => {
                Group.insertMany([{
                    name: "Family",
                    members: [
                        { email: "tester@test.com" },
                        { email: "new@email.com" }]
                }])

            }).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .get("/api/groups/Family/transactions/category/invisible") //Route to call
                        .set("Cookie", `accessToken=${newAccessTokenValid}; refreshToken=${newAccessTokenValid}`) //Setting cookies in the request
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

})

describe("deleteTransaction", () => { 

    test('deleteTransaction: returns status 200 if okay', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(async () => {
                    const testData = await transactions.findOne({username: "tester"})
                    request(app)
                        .delete("/api/users/tester/transactions") //Route to call
                        .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
                        .send({ _id: testData.id })
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(200)
                            expect(response.body.data).toHaveProperty("message");
                            done()
                        })
                })
            })
        })
    });

    test('deleteTransaction: returns status 400 if the request body does not contain all the necessary attributes', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .delete("/api/users/tester/transactions") //Route to call
                        .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
                        .send({  })
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    test('deleteTransaction: returns status 400 if the _id in the request body is an empty string', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .delete("/api/users/tester/transactions") //Route to call
                        .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
                        .send({ _id: "" })
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    test('deleteTransaction: returns status 400 if the username passed as a route parameter does not represent a user in the database', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([ {
                username: "admin",
                email: "admin@email.com",
                password: "admin",
                refreshToken: adminAccessTokenValid,
                role: "Admin"
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(async () => {
                    const testData = await transactions.findOne({ username: "tester" })
                    request(app)
                        .delete("/api/users/tester/transactions") //Route to call
                        .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
                        .send({ _id: testData.id })
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    test('deleteTransaction: returns status 400 if the _id in the request body does not represent a transaction in the database', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(async () => {
                    request(app)
                        .delete("/api/users/tester/transactions") //Route to call
                        .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
                        .send({ _id: "fakeid" })
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });
    
    test('deleteTransaction: returns status 400 if the _id in the request body represents a transaction made by a different user than the one in the route', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(async () => {
                    const testData = await transactions.findOne({ username: "tester" })
                    request(app)
                        .delete("/api/users/admin/transactions") //Route to call
                        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
                        .send({ _id: testData.id })
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    
    test('deleteTransaction: returns status 401 if user is not the same as the one in the route', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .delete("/api/users/admin/transactions") //Route to call
                        .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
                        .send({_id: "fakeid"})
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(401)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });
})

describe("deleteTransactions", () => { 

    test('deleteTransactions: returns status 200 if okay', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(async () => {
                    let testData = (await transactions.find({ username: "tester" }))
                    testData = testData.map((d) => d._id)
                    request(app)
                        .delete("/api/transactions") //Route to call
                        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
                        .send({ _ids: testData })
                        .then(async (response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(200)
                            expect(response.body.data).toHaveProperty("message");
                            expect((await transactions.find({ })).length).toBe(1)
                            done()
                        })
                })
            })
        })
    });

    test('deleteTransactions: returns status 200 if okay', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(async () => {
                    let testData = (await transactions.find({ username: "admin" }))
                    testData = testData.map((d) => d._id)
                    request(app)
                        .delete("/api/transactions") //Route to call
                        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
                        .send({ _ids: testData })
                        .then(async (response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(200)
                            expect(response.body.data).toHaveProperty("message");
                            expect((await transactions.find({})).length).toBe(2)
                            done()
                        })
                })
            })
        })
    });

    test('deleteTransactions: returns status 400 if the request body does not contain all the necessary attributes', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .delete("/api/transactions") //Route to call
                        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
                        .send({ unusefuldata: "i feel invisible" })
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    test('deleteTransactions: returns status 400 if at least one of the ids in the array is an empty string', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(async () => {
                    let testData = (await transactions.find({ username: "admin" }))
                    testData = [...testData.map((d) => d._id), ""]
                    request(app)
                        .delete("/api/transactions") //Route to call
                        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
                        .send({ _ids: testData })
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    test('deleteTransactions: returns status 400 if at least one of the ids in the array does not represent a transaction in the database', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(async () => {
                    let testData = (await transactions.find({ username: "admin" }))
                    testData = [...testData.map((d) => d._id), "plants are awesome"]
                    request(app)
                        .delete("/api/transactions") //Route to call
                        .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`) //Setting cookies in the request
                        .send({ _ids: testData })
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(400)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });

    test('deleteTransactions: returns status 401 if user is not admin', (done) => {
        categories.create([{
            type: "food",
            color: "red"
        }, {
            type: "drinks",
            color: "blue"
        }]).then(() => {
            //We insert two users in the datbase: an Admin and a user that made two transactions
            User.insertMany([{
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
            }]).then(() => {
                //We want to see that the function changes the type of existing transactions of the same type, so we create two transactions
                transactions.insertMany([{
                    username: "tester",
                    type: "food",
                    amount: 20
                }, {
                    username: "tester",
                    type: "food",
                    amount: 100
                }, {
                    username: "admin",
                    type: "drinks",
                    amount: 10000
                }]).then(() => {
                    request(app)
                        .delete("/api/transactions") //Route to call
                        .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`) //Setting cookies in the request
                        .send({ _ids: ["fakeid", "noId here"] })
                        .then((response) => { //After obtaining the response, we check its actual body content
                            expect(response.status).toBe(401)
                            const errorMessage = response.body.error ? true : response.body.message ? true : false
                            expect(errorMessage).toBe(true)
                            done()
                        })
                })
            })
        })
    });
})
