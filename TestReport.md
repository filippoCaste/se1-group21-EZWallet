# Test Report

<The goal of this document is to explain how the application was tested, detailing how the test cases were defined and what they cover>

# Contents

- [Dependency graph](#dependency-graph)

- [Integration approach](#integration-approach)

- [Tests](#tests)

- [Coverage](#Coverage)





# Dependency graph 

     <report the here the dependency graph of EzWallet>
     
# Integration approach

    <Write here the integration sequence you adopted, in general terms (top down, bottom up, mixed) and as sequence
    (ex: step1: unit A, step 2: unit A+B, step 3: unit A+B+C, etc)> 
    <Some steps may  correspond to unit testing (ex step1 in ex above)>
    <One step will  correspond to API testing, or testing unit route.js>
    


# Tests

   <in the table below list the test cases defined For each test report the object tested, the test level (API, integration, unit) and the technique used to define the test case  (BB/ eq partitioning, BB/ boundary, WB/ statement coverage, etc)>   <split the table if needed>


| Test case name | Object(s) tested | Test level | Technique used |

MISSING THE TECHNIQUE USED!!!

- auth.integration.test.js

|'POST /api/register'|'should return 400 if username, email or password are missing'|integration|--|
|'POST /api/register'|'should return 400 if username, email or password are empty strings'|integration|--|
|'POST /api/register'|'should return 400 if email is not in a valid format'|integration|--|
|'POST /api/register'|'should return 400 if username already exists'|integration|--|
|'POST /api/register'|'should return 400 when email format is invalid'|integration|--|
|'POST /api/register'|'should return 400 when username is already in use'|integration|--|
|'POST /api/register'|'should return 400 if email already exists'|integration|--|
|'POST /api/register'|'should return 200 and confirm user was added successfully'|integration|--|


|'registerAdmin'|'should register a new admin user'|integration|--|
|'registerAdmin'|should return 400 when missing fields|integration|--|
|'registerAdmin'|'should return 400 when fields are empty strings'|integration|--|
|'registerAdmin'|'Empty fields are not allowed'|integration|--|
|'registerAdmin'|'should return 400 when email format is invalid'|integration|--|
|'registerAdmin'|'should return 400 when username is already in use'|integration|--|
|'registerAdmin'|'should return 400 when email is already in use'|integration|--|
|'registerAdmin'|should return 500 if database operation fails|integration|--|



|'POST /api/login'|'should return 400 if email or password are missing'|integration|--|
|'POST /api/login'|'should return 400 if email or password are empty strings'|integration|--|
|'POST /api/login'|'should return 400 if email is not in a valid format''|integration|--|
|'POST /api/login'|''should return 400 if the user does not exist'|integration|--|
|'POST /api/login'|'should return 400 if the supplied password does not match with the one in the database'|integration|--|
|'POST /api/login'|'should return 200 and create an accessToken and refreshToken'|integration|--|


|'POST /api/logout'|'should return 400 if no refresh token is provided'|integration|--|
|'POST /api/logout'|'should return 400 if refresh token does not represent a user in the database'|integration|--|
|'POST /api/logout'|should return 200 and confirm user was logged out successfully'|integration|--|




- auth.unit.test.js

|'register'|'should register a new user successfully'|unit|--|
|'register'|'should return 400 error if the request body does not contain all the necessary attributes'|unit|--|
|'register'|'should return 400 error if at least one of the parameters in the request body is an empty string'|unit|--|
|'register'|'should return 400 error if the email in the request body is not in a valid email format'|unit|--|
|'register'|'should return 400 error if the username in the request body identifies an already existing user'|unit|--|
|'register'|'should return 400 error if the email in the request body identifies an already existing user'
|unit|--|
|'register'|'should return 500 error if there is a server error'|unit|--|


|'registerAdmin '|'should register a new admin user successfully'|unit|--|
|'registerAdmin '|'should return 400 error if the request body does not contain all the necessary attributes'|unit|--|
|'registerAdmin '|''should return 400 error if at least one of the parameters in the request body is an empty string'|unit|--|
|'registerAdmin '|'should return 400 error if the email in the request body is not in a valid email format'|unit|--|
|'registerAdmin '|'should return 400 error if the username in the request body identifies an already existing user'|unit|--|
|'registerAdmin '|'should return 400 error if the email in the request body identifies an already existing user'|unit|--|
|'registerAdmin '|'should return 500 error if there is a server error'|unit|--|


|'login'|'should log in a user successfully'|unit|--|
|'login'|'should return 400 error if the request body does not contain all the necessary attributes'|unit|--|
|'login'|'should return 400 error if at least one of the parameters in the request body is an empty string'|unit|--|
|'login'|'should return 400 error if the email in the request body is not in a valid email format'|unit|--|
|'login'|'should return 400 error if the email in the request body does not identify a user in the database'|unit|--|
|'login'|'should return 400 error if the supplied password does not match with the one in the database'|unit|--|
|'login'|'should return 500 error if there is a server error'|unit|--|


|'logout'|'should logout a user successfully'|unit|--|
|'logout'|'should return 400 error if the request does not have a refresh token in the cookies'|unit|--|
|'logout'|'should return 400 error if the refresh token in the request\'s cookies does not represent a user in the database'|unit|--|
|'logout'|'should return 500 error if there is a server error'|unit|--|



- controller.integration.test.js

|'createCategory'|'createCategory: returns status 200 if admin creates a new category'|Integration|--|
|'createCategory'|'createCategory: returns status 401 if user tries to create a new category'|Integration|--|
|'createCategory'|'createCategory: returns status 400 if some parameters are not provided'|Integration|--|
|'createCategory'|returns status 400 if some parameters are empty'|Integration|--|
|'createCategory'|createCategory: returns status 400 if the type of category passed in the request body represents an already existing category in the database'|Integration|--|

|'updateCategory'|'Returns a message for confirmation and the number of updated transactions'|Integration|--|
|'updateCategory'|'Returns a 400 error if the type of the new category is the same as one that exists already and that category is not the requested one'|Integration|--|
|'updateCategory'|'Returns a 400 error  if at least one of the parameters in the request body is an empty string'|Integration|--|
|'updateCategory'|'Returns a 400 error if the type of category passed as a route parameter does not represent a category in the databas'|Integration|--|
|'updateCategory'|'Returns a 400 error if the request body does not contain all the necessary parameters'|Integration|--|
|'updateCategory'|'Returns a 401 error if called by a user who is not an Admin'|Integration|--|



|'deleteCategory'|'returns status 400 if at least one of the types in the array does not represent a category in the database'|Integration|--|
|'deleteCategory'|'returns status 401 if called by an authenticated user who is not an admin'|Integration|--|


|'getCategories'|'returns status 200 if okay - user'|Integration|--|
|'getCategories'|'getCategories: returns status 200 if okay - admin'|Integration|--|
|'getCategories'|returns status 401 if user is not authenticated'|Integration|--|


|'createTransaction'|'returns status 200 if okay - user'|Integration|--|
|'createTransaction'|'returns status 200 if okay - user - negative'|Integration|--|
|'createTransaction'|'returns status 200 if okay - admin'|Integration|--|
|'createTransaction'|' returns status 400 if the request body does not contain all the necessary attributes'|Integration|--|
|'createTransaction'|'returns status 400 if at least one of the parameters in the request body is an empty string'|Integration|--|
|'createTransaction'|'createTransaction: returns status 400 if the type of category passed in the request body does not represent a category in the database'|Integration|--|
|'createTransaction'|' returns status 400 if the username passed in the request body is not equal to the one passed as a route parameter'|Integration|--|


-- controller.unit.test.js

|'createCategory'|'Should successfully create a Category'|unit|--|
|'createCategory'|'Should return 400 error if the body is missing a parameter'|unit|--|
|'createCategory'|'Should return 400 if at least one of the parameters in the request body is an empty string'|unit|--|
|'createCategory'|'Should return 401 if the User is not an authorized'|unit|--|
|'createCategory'|'Should return 400 if a category with the same type already exists'|unit|--|
|'createCategory'|'Should return 500 if there is a Server Error'|unit|--|

|'updateCategory'|'Invalid color'|unit|--|
|'updateCategory'|'Category not found'|unit|--|
|'updateCategory'|'Unauthorized user'|unit|--|


|'deleteCategory'|'Category does not exist'|unit|--|
|'deleteCategory'|'Deletes categories successfully'|unit|--|
|'deleteCategory'|'Returns 400 if parameters are not enough'|unit|--|
|'deleteCategory'|'Returns 400 if the category doesnt exist'|unit|--|
|'deleteCategory'|'Returns 400 if empty string is found in types array'|unit|--|


|'getCategories'|'Should return all categories'|unit|--|
|'getCategories'|'Should return empty array if there are no categories'|unit|--|
|'getCategories'|'Should return 401 if User is not authorized'|unit|--|
|'getCategories'|'Should return 500 if there is a Server Error'|unit|--|

//KEEP ON WITH CreateTransaction()...










# Coverage



## Coverage of FR

<Report in the following table the coverage of  functional requirements (from official requirements) >

--HERE I JUST WROTE DOWN ALL THE REQUIREMENTS OF THE LIST, TO COMPLETE WHICH ONES ARE FULLFILLED...--

| Functional Requirements covered |   Test(s) | 
| ------------------------------- | ----------- | 
| FRx                             |             |             
| FRy                             |             | 
| ... ||

FR1-Manage users
-------------
FR11-register-create a new user |   Test(s) | 
FR12-login-authorize access for a given user|   Test(s) | 
FR13-logout-stop authorization for a given user|   Test(s) | 
FR14-registerAdmin-create a new Admin|   Test(s) | 
FR15-getUsers-return all users|   Test(s) | 
FR16-getUser-return info about a specific user|   Test(s) | 
FR17-deleteUser-cancel a user|   Test(s) | 
FR20-Manage groups|   Test(s) | 
------------
FR21-createGroup-create a new group|   Test(s) | 
FR22-getGroups-return all groups|   Test(s) | 
FR23-getGroup-return info about a specific group|   Test(s) | 
FR24-addToGroup-add many users to a given group|   Test(s) | 
FR26-removeFromGroup-remove many users from a given group|   Test(s) | 
FR28-deleteGroup-cancel a group, users members of the group remain unchanged|   Test(s) | 
FR30-Manage  transactions
--------------
FR31-createTransaction-create a new transaction|   Test(s) | 
FR32-getAllTransactions-return all transactions (by all users)|   Test(s) | 
FR33-getTransactionsByUser-return transactions of a given user. transactions may be filtered by date, by period by max / min amount|   Test(s) | 
FR34-getTransactionsByUserByCategory-return transactions of a given user and a given category|   Test(s) | 
FR35-getTransactionsByGroup-return all transactions of all users of a given group|   Test(s) | 
FR36-getTransactionsByGroupByCategory-return all transactions of all users of a given group, filtered by a given category|   Test(s) | 
FR37-deleteTransaction-delete a given transaction|   Test(s) | 
FR38-deleteTransactions-delete many transactions|   Test(s) | 
FR40-Manage categories|   Test(s) | 
-------------
FR41-createCategory-create a new category |   Test(s) | 
FR42-updateCategory-modify existing category|   Test(s) | 
FR43-deleteCategory-delete a given category|   Test(s) | 
FR44-getCategories-list all categories|   Test(s) | 

## Coverage white box

Report here the screenshot of coverage values obtained with jest-- coverage 






