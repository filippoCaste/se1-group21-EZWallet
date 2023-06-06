# EZWallet
EZWallet is a web application designed to help individuals and families keep track of their 
expenses. Users can enter and categorize their expenses, allowing them to quickly see where their 
money is going. EZWallet is a powerful tool for those looking to take control of their finances and 
make informed decisions about their spending.

## Installation and setup.
The code can be either run locally, calling the endpoints on Postman or run it using Docker.
All the information about installation and setup is fully described in the following file: https://git-softeng.polito.it/se-2022-23/group-21/ezwallet/-/blob/dev/code/README.md


## Usage

Explain how to use your program. Provide code examples or step-by-step instructions to demonstrate how to run and utilize your program effectively.

## Features

- Feature 1: Describe the first feature of your program.
- Feature 2: Describe the second feature of your program.
- ...

## Contribution

Explain how other users can contribute to your program. Include guidelines for making suggestions, reporting issues, or submitting pull requests.

## Dependencies

- Dependency 1: Specify dependency 1 and its version.
- Dependency 2: Specify dependency 2 and its version.
- ...

## License

Specify the license under which your program is distributed. You can use a license template like the MIT License or any other that suits your needs.

## Contact

- Email: your@email.com
- Twitter: @yourusername
- Other contact channels (optional)

## Credits

- Resource 1: Describe resource 1 and provide the corresponding link.
- Resource 2: Describe resource 2 and provide the corresponding link.

## TESTS 
This repository contains the code for testing the endpoints of a web application using Jest and Supertest.
Test classes, including integration and unit tests, have been developed to ensure the functionality of implemented functions. The following test names correspond to the test files:

 The integration test files are as follows:

users.integration.test.js
utils.integration.test.js
auth.integration.test.js
controller.integration.test.js
- The unit test files are as follows:

users.unit.test.js
utils.unit.test.js
auth.unit.test.js
controller.unit.test.js
These tests aim to ensure that the implemented functions perform as expected and handle different scenarios appropriately. 
 
 These tests ensure the correctness and reliability of the implemented functions.

## Installation
Clone the repository: git clone <repository_url>
Install dependencies: npm install

## Usage
Start the server: npm start
Run the tests: npm test

## Description
The purpose of this project is to demonstrate how to perform API testing using Jest and Supertest. The tests are written in JavaScript and are located in the tests directory. The app.js file contains the implementation of the API endpoints.

## Dependencies
The project relies on the following dependencies:

- Jest: A popular JavaScript testing framework that provides a simple and intuitive API for writing tests.
- Supertest: A library that enables HTTP request testing by providing a high-level API for sending requests and asserting responses.
- Mongoose: A MongoDB object modeling tool used for connecting to and interacting with the MongoDB database.
- Bcrypt.js: A library for hashing and comparing passwords, used for secure password storage.
- JSON Web Token (JWT): A library for generating and verifying JSON web tokens, used for authentication and authorization.

## Tests Descripton

- auth.unit.test.js
The code includes unit tests for the authentication functionality, covering different scenarios such as successful registration, incomplete request body, empty fields, invalid email format, existing username or email, incorrect login credentials, and logout.

Note: The code is mocked to simulate the database and external dependencies. The mocks are used to test the logic and behavior of the authentication system in isolation.

- auth.integration.test.js
The tests cover various scenarios, including registering a user, logging in, logging out, and registering an admin user. The tests verify the expected behavior of the API endpoints and check for error handling and validation.


