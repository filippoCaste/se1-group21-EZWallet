# Test Report

<The goal of this document is to explain how the application was tested, detailing how the test cases were defined and what they cover>

# Contents

- [Dependency graph](#dependency-graph)

- [Integration approach](#integration-approach)

- [Tests](#tests)

- [Coverage](#Coverage)

# Dependency graph 

     <report the here the dependency graph of EzWallet>
![](imgs/dependency_graph.jpg)

> No NEW dependencies have been added

     
# Integration approach

    <Write here the integration sequence you adopted, in general terms (top down, bottom up, mixed) and as sequence
    (ex: step1: unit A, step 2: unit A+B, step 3: unit A+B+C, etc)> 
    <Some steps may  correspond to unit testing (ex step1 in ex above)>
    <One step will  correspond to API testing, or testing unit route.js>


    The integration sequence followed was the mixed one since the units were developed following the integration sequence order, in this way:

    - For some cases Bottom up was applied, following the sequence: 
            step 1: function A
            step 2: function B
            step 3: testing function A + B as if they were a single unit.
            step 4: test all. If defects are found, they will come from the interaction between fucntions.

    - For some other cases, Top down was applied, following the sequence:
            step 1: function A
            step 2: interaction function A-B and A-C
            step 3: testing function D, and interaction to previous functions.
            
# Tests

   <in the table below list the test cases defined For each test report the object tested, the test level (API, integration, unit) and the technique used to define the test case  (BB/ eq partitioning, BB/ boundary, WB/ statement coverage, etc)>   <split the table if needed>


| Test case name | Object(s) tested | Test level | Technique used |
|---|----|---|---|
|'POST /api/register'|'should return 400 if username, email or password are missing'|integration|BB|
|'POST /api/register'|'should return 400 if username, email or password are empty strings'|integration|BB|
|'POST /api/register'|'should return 400 if email is not in a valid format'|integration|BB|
|'POST /api/register'|'should return 400 if username already exists'|integration|BB|
|'POST /api/register'|'should return 400 when email format is invalid'|integration|BB|
|'POST /api/register'|'should return 400 when username is already in use'|integration|BB|
|'POST /api/register'|'should return 400 if email already exists'|integration|BB|
|'POST /api/register'|'should return 200 and confirm user was added successfully'|integration|BB
|'registerAdmin'|'should register a new admin user'|integration|BB|
|'registerAdmin'|should return 400 when missing fields|integration|BB|
|'registerAdmin'|'should return 400 when fields are empty strings'|integration|BB|
|'registerAdmin'|'Empty fields are not allowed'|integration|BB|
|'registerAdmin'|'should return 400 when email format is invalid'|integration|BB|
|'registerAdmin'|'should return 400 when username is already in use'|integration|BB|
|'registerAdmin'|'should return 400 when email is already in use'|integration|BB|
|'registerAdmin'|should return 500 if database operation fails|integration|BB|
|'POST /api/login'|'should return 400 if email or password are missing'|integration|BB|
|'POST /api/login'|'should return 400 if email or password are empty strings'|integration|BB|
|'POST /api/login'|'should return 400 if email is not in a valid format''|integration|BB|
|'POST /api/login'|''should return 400 if the user does not exist'|integration|BB|
|'POST /api/login'|'should return 400 if the supplied password does not match with the one in the database'|integration|BB|
|'POST /api/login'|'should return 200 and create an accessToken and refreshToken'|integration|BB|
|'POST /api/logout'|'should return 400 if no refresh token is provided'|integration|BB|
|'POST /api/logout'|'should return 400 if refresh token does not represent a user in the database'|integration|BB|
|'POST /api/logout'|should return 200 and confirm user was logged out successfully'|integration|BB|
|'register'|'should register a new user successfully'|unit|WB|
|'register'|'should return 400 error if the request body does not contain all the necessary attributes'|unit|WB|
|'register'|'should return 400 error if at least one of the parameters in the request body is an empty string'|unit|WB|
|'register'|'should return 400 error if the email in the request body is not in a valid email format'|unit|WB|
|'register'|'should return 400 error if the username in the request body identifies an already existing user'|unit|WB|
|'register'|'should return 400 error if the email in the request body identifies an already existing user'
|unit|WB|
|'register'|'should return 500 error if there is a server error'|unit|WB|
|'registerAdmin '|'should register a new admin user successfully'|unit|WB|
|'registerAdmin '|'should return 400 error if the request body does not contain all the necessary attributes'|unit|WB|
|'registerAdmin '|''should return 400 error if at least one of the parameters in the request body is an empty string'|unit|WB|
|'registerAdmin '|'should return 400 error if the email in the request body is not in a valid email format'|unit|WB|
|'registerAdmin '|'should return 400 error if the username in the request body identifies an already existing user'|unit|WB|
|'registerAdmin '|'should return 400 error if the email in the request body identifies an already existing user'|unit|WB|
|'registerAdmin '|'should return 500 error if there is a server error'|unit|WB|
|'login'|'should log in a user successfully'|unit|WB|
|'login'|'should return 400 error if the request body does not contain all the necessary attributes'|unit|WB|
|'login'|'should return 400 error if at least one of the parameters in the request body is an empty string'|unit|WB|
|'login'|'should return 400 error if the email in the request body is not in a valid email format'|unit|WB|
|'login'|'should return 400 error if the email in the request body does not identify a user in the database'|unit|WB|
|'login'|'should return 400 error if the supplied password does not match with the one in the database'|unit|WB|
|'login'|'should return 500 error if there is a server error'|unit|WB|
|'logout'|'should logout a user successfully'|unit|WB|
|'logout'|'should return 400 error if the request does not have a refresh token in the cookies'|unit|WB|
|'logout'|'should return 400 error if the refresh token in the request\'s cookies does not represent a user in the database'|unit|WB|
|'logout'|'should return 500 error if there is a server error'|unit|WB|
|'createCategory'|'createCategory: returns status 200 if admin creates a new category'|Integration|BB|
|'createCategory'|'createCategory: returns status 401 if user tries to create a new category'|Integration|BB|
|'createCategory'|'createCategory: returns status 400 if some parameters are not provided'|Integration|BB|
|'createCategory'|returns status 400 if some parameters are empty'|Integration|BB|
|'createCategory'|createCategory: returns status 400 if the type of category passed in the request body represents an already existing category in the database'|Integration|BB|
|'updateCategory'|'Returns a message for confirmation and the number of updated transactions'|Integration|BB|
|'updateCategory'|'Returns a 400 error if the type of the new category is the same as one that exists already and that category is not the requested one'|Integration|BB|
|'updateCategory'|'Returns a 400 error  if at least one of the parameters in the request body is an empty string'|Integration|BB|
|'updateCategory'|'Returns a 400 error if the type of category passed as a route parameter does not represent a category in the databas'|Integration|BB|
|'updateCategory'|'Returns a 400 error if the request body does not contain all the necessary parameters'|Integration|BB|
|'updateCategory'|'Returns a 401 error if called by a user who is not an Admin'|Integration|BB|
|'deleteCategory'|'returns status 400 if at least one of the types in the array does not represent a category in the database'|Integration|BB|
|'deleteCategory'|'returns status 401 if called by an authenticated user who is not an admin'|Integration|BB|
|'getCategories'|'returns status 200 if okay - user'|Integration|BB|
|'getCategories'|'getCategories: returns status 200 if okay - admin'|Integration|BB|
|'getCategories'|returns status 401 if user is not authenticated'|Integration|BB|
|'createTransaction'|'returns status 200 if okay - user'|Integration|BB|
|'createTransaction'|'returns status 200 if okay - user - negative'|Integration|BB|
|'createTransaction'|'returns status 200 if okay - admin'|Integration|BB|
|'createTransaction'|' returns status 400 if the request body does not contain all the necessary attributes'|Integration|BB|
|'createTransaction'|'returns status 400 if at least one of the parameters in the request body is an empty string'|Integration|BB|
|'createTransaction'|'createTransaction: returns status 400 if the type of category passed in the request body does not represent a category in the database'|Integration|BB|
|'createTransaction'|' returns status 400 if the username passed in the request body is not equal to the one passed as a route parameter'|Integration|BB|
|'createCategory'|'Should successfully create a Category'|unit|White Box|
|'createCategory'|'Should return 400 error if the body is missing a parameter'|unit|White Box|
|'createCategory'|'Should return 400 if at least one of the parameters in the request body is an empty string'|unit|White Box|
|'createCategory'|'Should return 401 if the User is not an authorized'|unit|White Box|
|'createCategory'|'Should return 400 if a category with the same type already exists'|unit|White Box|
|'createCategory'|'Should return 500 if there is a Server Error'|unit|White Box|
|'updateCategory'|'Invalid color'|unit|White Box|
|'updateCategory'|'Category not found'|unit|White Box|
|'updateCategory'|'Unauthorized user'|unit|White Box|
|'deleteCategory'|'Category does not exist'|unit|White Box|
|'deleteCategory'|'Deletes categories successfully'|unit|White Box|
|'deleteCategory'|'Returns 400 if parameters are not enough'|unit|White Box|
|'deleteCategory'|'Returns 400 if the category doesnt exist'|unit|White Box|
|'deleteCategory'|'Returns 400 if empty string is found in types array'|unit|White Box|
|'getCategories'|'Should return all categories'|unit|White Box|
|'getCategories'|'Should return empty array if there are no categories'|unit|White Box|
|'getCategories'|'Should return 401 if User is not authorized'|unit|White Box|
|'getCategories'|'Should return 500 if there is a Server Error'|unit|White Box|
|'createTransaction'|'Should successfully create a transaction'|unit|White Box|
|'createTransaction'|'Should return 401 if the User is not an authorized'|unit|White Box|
|'createTransaction'|'Should return 400 if some parameters are missing'|unit|White Box|
|'createTransaction'|'Should return 400 if some parameters are empty'|unit|White Box|
|'createTransaction'|'Should return 400 if category does not exist'|unit|White Box|
|'createTransaction'|'Should return 400 if username and URL username mismatch'|unit|White Box|
|'createTransaction'|'Should return 400 if amount is invalid'|unit|White Box|
|'createTransaction'|'Should return 500 if there is a Server Error'|unit|White Box|

CONTINUE WITH GET ALL TRANSACTIONS



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

