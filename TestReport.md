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
|'getAllTransactions'|'Should return transactions data if the User is authorized'|unit|White Box|
|'getAllTransactions'|'Should return 401 if the User is not an authorized'|unit|White Box|
|'getAllTransactions'|'Should return 500 if there is a Server Error'|unit|White Box|
|'getTransactionsByUser'|'Should return all transactions for the specified regular user'|unit|White Box|
|'getTransactionsByUser'|' "Should return 401 if authorized but in the wrong path'|unit|White Box|
|'getTransactionsByUser'|'Should return 400 if the user does not exist'|unit|White Box|
|'getTransactionsByUser'|'Should return filtered transactions based on query parameters'|unit|White Box|
|'getTransactionsByUser'|'Should return 500 if there is a Server Error'|unit|White Box|
|'getTransactionsByUserByCategory'|'Should return transactions for the specified user and category'|unit|White Box|
|'getTransactionsByUser'|'Should return 400 if the user does not exist'|unit|White Box|
|'getTransactionsByUser'|'"Should return 400 if the category does not exist"'|unit|White Box|
|'getTransactionsByUser'|'Should return 401 if not authorized as admin'|unit|White Box|
|'getTransactionsByUser'|'Should return 401 if authorized as User but in the admin path'|unit|White Box|
|'getTransactionsByUser'|'Should return 500 if there is a server error'|unit|White Box|
|'getTransactionsByGroup'|'Should return transactions for the specified group|unit||White Box|
|'getTransactionsByGroup'|'Should return 400 if the group does not exist'|unit||White Box|
|'getTransactionsByGroup'|'Should return 401 if not authorized as admin or group member|unit||White Box|
|'getTransactionsByGroup'|'Should return 500 if there is a Server Error'|unit||White Box|
|'getTransactionsByGroupByCategory'|'Should return transactions grouped by category for the specified group'|unit||White Box|
|'getTransactionsByGroupByCategory'|'Should return 400 if the group does not exist'|unit||White Box|
|'getTransactionsByGroupByCategory'|'Should return 500 if there is a Server Error'|unit||White Box|
|'deleteTransaction'|'Should delete the transaction for the specified user'|White Box|
|'deleteTransaction'|'Should return 401 if not authorized'|White Box|
|'deleteTransaction'|'Should return 400 if '_id' is not provided in the request body'|White Box|
|'deleteTransaction'|'Should return 400 if '_id' is empty'|White Box|
|'deleteTransaction'|'Should return 400 if the user does not exist'|White Box|
|'deleteTransaction'|'Should return 400 if the provided id does not match any transaction'|White Box|
|'deleteTransaction'|'Should return 400 if the user tries to delete other user's transaction'|White Box|
|'deleteTransaction'|'Should return 500 if there is a Server Error'|White Box|
|'deleteTransactions'|'Should delete multiple transactions when authorized and valid parameters are provided'|unit||White Box|
|'deleteTransactions'|'Should return 401 if not authorized'|unit||White Box|
|'deleteTransactions'|'Should return 400 if '_ids' is not provided in the request body'|unit||White Box|
|'deleteTransactions'|'Should return 400 if there is at least one id empty'|unit||White Box|
|'deleteTransactions'|'Should return 400 if any of the provided ids do not match any transaction'|unit||White Box|
|'deleteTransactions'|'Should return 500 if there is a Server Error'|unit||White Box|
|'getUsers'|'should return empty list if there are no users'|Integration||Black Box|
|'getUsers'|'should retrieve list of all users'|integration||Black Box|
|'getUsers'|'Should return an array of users when called by an authenticated admin|unit|White box|
|'getUsers'|'Should return 401 if called by an authenticated user who is not an admin'|unit|White box|
|'getUsers'|'Should return 500 if there is a Server Error'|unit|White box|
|'getUser'|'Should return user data when called by an authenticated user'|unit|White box|
|'getUser'|'Should return user not found error if user does not exist'|unit|White box|
|'getUser'|'Should return user data when called by an authenticated admin'|unit|White box|
|'getUser'|'Should return unauthorized error if both user and admin auth fail'|unit|White box|
|'getUser'|'Should return 500 if there is a Server Error'|unit|White box|
|'createGroup|'Should successfully create a Group'|unit|White box|
|'createGroup'|Should return 401 if not authorized'|unit|White box|
|'createGroup'|Should return 400 if request body is incomplete'|unit|White box|
|'createGroup'|Should return 401 if not authorized'|unit|White box|
|'createGroup'|Should return 400 if name field is empty'|unit|White box|
|'createGroup'|"Should return 400 if a group with the same name already exists'|unit|White box|
|'createGroup'|"Should return 400 if the user calling the API is already in a group'|unit|White box|
|'createGroup'|"Should return 400 if invalid memberEmail format'|unit|White box|
|'createGroup'|"Should return 400 if all memberEmails are already in a group or do not exist in the database'|unit|White box|
|'createGroup'|"Should return 500 if there is a Server Error'|unit|White box|
|'getGroups'|"Should successfully retrieve all groups'|unit|White box|
|'getGroups'|"Should successfully retrieve a group by name'|unit|White box|
|'getGroups'|"Should return 400 if the group does not exist'|unit|White box|
|'getGroup'|"Should return 401 if not authorized as an admin or a group member'|unit|White box|
|'getGroup'|"Should return 500 if there is a Server Error'|unit|White box|
|'addToGroup'|"Should add members to the specified group'|unit|White box|
|'addToGroup'|"Should return 400 if the group does not exist'|unit|White box|
|'addToGroup'|"Should return 400 if something is missing in the request body'|unit|White box|
|'addToGroup'|"Should return 400 if some of memberEmails are not in valid format'|unit|White box|
|'addToGroup'|"Should return 400 if all memberEmails do not exist or are already in a group'|unit|White box|
|'addToGroup'|"Should return 401 if not authorized as an admin or a group member'|unit|White box|
|'addToGroup'|"Should return 400 if something is missing in the request body'|unit|White box|
|'addToGroup'|"Should return 500 if there is a Server Error'|unit|White box|
|'removeFromGroup'|"Should remove members from the specified group'|unit|White box|
|'removeFromGroup'|"Should return 400 if the group does not exist'|unit|White box|
|'removeFromGroup'|"Should return 400 if memberEmails is missing in the request body'|unit|White box|
'removeFromGroup'|"Should remove members from the specified group'|unit|White box|
|'removeFromGroup'|"Should return 400 if memberEmails are not in valid format'|unit|White box|
|'removeFromGroup'|"Should return 400 if removing the last member of the group'|unit|White box|
|'removeFromGroup'|"Should return 400 if memberEmails do not exist or are not in the group'|unit|White box|
|'removeFromGroup'|"Should return 401 if not authorized as an admin or a group member'|unit|White box|
|'removeFromGroup'|"Should return 500 if there is a Server Error|unit|White box|
|'removeFromGroup'|"Should keep the first member when removing all members from the group"|unit|White box|
|'deleteUser'|"Should delete a user and remove from group"|unit|White box|
|'deleteUser'|"Should delete a user and remove from group"|unit|White box|
|'deleteUser'|"Should return 400 if email is missing in the request body"|unit|White box|
|'deleteUser'|"Should return 400 if email is not in valid format"|unit|White box|
|'deleteUser'|"Should return 400 if the user does not exist"|unit|White box|
|'deleteUser'|"Should return 400 if trying to delete an admin"|unit|White box|
|'deleteUser'|"Should return 500 if there is a Server Error"|unit|White box|
|'deleteUser'|"Should return 401 if not authorized as an admin"|unit|White box|
|'deleteGroup'|"Should delete a group"|unit|White box|
|'deleteUser'|"Should return 400 if name is missing in the request body"|unit|White box|
|'deleteUser'|"Should return 400 if name is an empty string"|unit|White box|
|'deleteUser'|"Should return 400 if the group does not exist"|unit|White box|
|'deleteUser'|"Should return 500 if there is a Server Error"|unit|White box|
|'deleteUser'|"Should return 401 if not authorized as an admin"|unit|White box|
|'verifyAuth'|'Tokens are both valid and belong to the requested user'|Integration|Black Box|
|'verifyAuth'|'Tokens are both valid and user belongs to the requested group'|Integration|Black Box|
|'verifyAuth'|'Tokens are both valid and user does not belong to the requested group'|Integration|Black Box|
|'verifyAuth'|'Tokens are both valid and belong to the requested admin'|Integration|Black Box|
|'verifyAuth'|'User tries to access as admin not granted'|Integration|Black Box|
|'verifyAuth'|'Admin accesses as simple user'|Integration|Black Box|
|'verifyAuth'|'User accesses as simple user'|Integration|Black Box|
|'verifyAuth'|'Undefined tokens'|Integration|Black Box|
|'verifyAuth'|'Missing parameters in refresh token'|Integration|Black Box|
|'verifyAuth'|'Refresh token empty'|Integration|Black Box|
|'verifyAuth'|'Access token username does not correspond to refresh token'|Integration|Black Box|
|'verifyAuth'|'Access token expired and refresh token belonging to the requested user'|Integration|Black Box|
|'verifyAuth'|'Access token and refresh token expired belonging to the requested user'|Integration|Black Box|
|'handleDateFilterParams'|'should handle valid date range and authenticated user'|Integration|Black Box|
|'handleDateFilterParams'|'should handle valid exact date and authenticated user|Integration|Black Box|
|'handleDateFilterParams'|'should handle invalid from and authenticated user'|Integration|Black Box|
|'handleDateFilterParams'|'should handle invalid upTo and authenticated user'|Integration|Black Box|
|'handleDateFilterParams'|'should handle invalid date and authenticated user'|Integration|Black Box|
|'handleDateFilterParams'|'should handle invalid date with other param and authenticated user'|Integration|Black Box|
|'handleDateFilterParams'|'should handle invalid date range and authenticated user|Integration|Black Box|
|'handleDateFilterParams'|'should handle invalid date range (month) and authenticated user|Integration|Black Box|
|'handleDateFilterParams'|'should handle invalid date range (year) and authenticated user|Integration|Black Box|
|'handleDateFilterParams'|'should handle invalid date range and authenticated user|Integration|Black Box|
|'handleDateFilterParams'|'should handle not enough parameter and authenticated user|Integration|Black Box|
|'handleDateFilterParams'|'should handle empty query parameter and authenticated user|Integration|Black Box|
|'handleAmountFilterParams'|'should handle valid amount range and authenticated user|Integration|Black Box|
|'handleAmountFilterParams'|'should handle valid amount value and authenticated user|Integration|Black Box|
|'handleAmountFilterParams'|'should handle valid amount range and authenticated user|Integration|Black Box|
|'handleAmountFilterParams'|'should handle invalid max amount and authenticated user|Integration|Black Box|
|'handleAmountFilterParams'|'should handle invalid min amount and authenticated user|Integration|Black Box|
|'handleAmountFilterParams'|'should handle invalid amount range and authenticated user|Integration|Black Box|
|'handleAmountFilterParams'|'should handle empty input and authenticated user|Integration|Black Box|
|'handleAmountFilterParams'|'should handle invalid input and authenticated user|Integration|Black Box|
|'handleDateFilterParams'|"should return an empty object for an empty query"|unit|White box|
|'handleDateFilterParams'|"should return matchStage with $gte condition for valid "from" parameter"|unit|White box|
|'handleDateFilterParams'|"should return matchStage with $gte condition for valid "from" parameter"|unit|White box|
|'handleDateFilterParams'|"should return matchStage with $gte condition for valid "from" parameter"|unit|White box|
|'handleDateFilterParams'|"should return matchStage with $gte condition for valid "from" parameter"|unit|White box|
|'handleDateFilterParams'|"should throw an error for invalid "from" parameter"|unit|White box|
|'handleDateFilterParams'|"should return matchStage with $lte condition for valid "upTo" parameter"|unit|White box|
|'handleDateFilterParams'|"should throw an error for invalid "upTo" parameter"|unit|White box|
|'handleDateFilterParams'|"should return matchStage with $gte and $lte conditions for valid "date" parameter"|unit|White box|
|'handleDateFilterParams'|"should throw an error for "date" parameter with conflicting parameters"|unit|White box|
|'handleDateFilterParams'|"should throw an error for invalid "date" parameter"|unit|White box|
|'handleDateFilterParams'|"should throw an error for invalid "date" parameter"|unit|White box|
|'handleDateFilterParams'|"should throw an error for invalid "date" parameter"|unit|White box|
|'handleDateFilterParams'|"should throw an error for conflicting "upTo" and "from" parameters"|unit|White box|
|'handleDateFilterParams'|"should throw an error when date2 month is after date1"|unit|White box|
|'handleDateFilterParams'|"should not throw an error after the isAfter method check"|unit|White box|
|'verifyAuth'|"should return authorized false and cause Unauthorized if one of the token is missing"|unit|White box|
|'verifyAuth'|"should return authorized false and cause Token is missing information if one of the access token information is missing"|unit|White box|
|'verifyAuth'|"should return authorized false and cause Token is missing information if one of the refresh token information is missing"|unit|White box|
|'verifyAuth'|"should return authorized false and cause Mismatched users if a field of the AToken is not equal to the same field of the RToken"|unit|White box|
|'verifyAuth'|"should return authorized true and cause Authorized for Admin authType with valid role"|unit|White box|
|'verifyAuth'|"should return authorized false and cause Unauthorized for Admin authType with invalid role"|unit|White box|
|'verifyAuth'|"should return authorized true and cause Authorized for User authType with valid username and role"|unit|White box|
|'verifyAuth'|"should return authorized false and cause Unauthorized for User authType with invalid username"|unit|White box|
|'verifyAuth'|"should return authorized true and cause Authorized for Group authType with valid email"|unit|White box|
|'verifyAuth'|"should return authorized true and cause Authorized for Group authType with valid email"|unit|White box|
|'verifyAuth'|"should return authorized false and cause Unauthorized for Group authType with invalid email"|unit|White box|
|'verifyAuth'|"should return authorized false and cause Unknown auth type for unknown authType"|unit|White box|
|'verifyAuth'|"should return authorized true and cause Authorized after refreshing the accessToken"|unit|White box|
|'verifyAuth'|"should return authorized false and cause Perform login again after failing to refresh the accessToken"|unit|White box|
|'verifyAuth'|"should return authorized false and cause Error if the refreshToken throw an unexpected error"|unit|White box|
|'verifyAuth'|"should return authorized false and cause Error if the accessToken throw an unexpected error"|unit|White box|
|'handleAmountFilterParams'|"should return an empty object when no query params are present"|unit|White box|
|'handleAmountFilterParams'|"should return an object with $gte attribute when min query param is present and valid"|unit|White box|
|'handleAmountFilterParams'|"should return an object with $lte attribute when max query param is present and valid"|unit|White box|
|'handleAmountFilterParams'|""should return an object with $gte and $lte attributes when min and max query params are present and valid|unit|White box|
|'handleAmountFilterParams'|"should throw error when min or max query param is not a number"|unit|White box|
|'handleAmountFilterParams'|"should throw error when min is greater than max"|unit|White box|


# Coverage


## Coverage of FR

<Report in the following table the coverage of  functional requirements (from official requirements) >

--HERE I JUST WROTE DOWN ALL THE REQUIREMENTS OF THE LIST, TO COMPLETE WHICH ONES ARE FULLFILLED...--

| Functional Requirements covered |   Test(s) | 
| ------------------------------- | ----------- | 
| FRx                             |             |             
| FRy                             |             | 
| ... ||

| FR1-Manage users   | |
|-----------------------|---------|  
| FR12-login-authorize access for a given user           |   Test(s) | 
|FR13-logout-stop authorization for a given user        |   Test(s) | 
|FR14-registerAdmin-create a new Admin                  |   Test(s) | 
|FR15-getUsers-return all users                         |   Test(s) | 
|FR16-getUser-return info about a specific user         |   Test(s) | 
|FR17-deleteUser-cancel a user                          |   Test(s) | 

|FR20-Manage groups      ||                               
| ----------------------- | --------- |
|FR21-createGroup-create a new group                    |   Test(s) | 
|FR22-getGroups-return all groups                       |   Test(s) | 
|FR23-getGroup-return info about a specific group       |   Test(s) | 
|FR24-addToGroup-add many users to a given group        |   Test(s) | 
|FR26-removeFromGroup-remove many users from a given group|   Test(s) | 
|FR28-deleteGroup-cancel a group, users members of the group remain unchanged|   Test(s) | 

|FR30-Manage  transactions ||
|-----------------------|---------|
|FR31-createTransaction-create a new transaction|   Test(s) | 
|FR32-getAllTransactions-return all transactions (by all users)|   Test(s) | 
|FR33-getTransactionsByUser-return transactions of a given user. transactions may be filtered by date, by period by max / min amount|   Test(s) | 
|FR34-getTransactionsByUserByCategory-return transactions of a given user and a given category|   Test(s) | 
|FR35-getTransactionsByGroup-return all transactions of all users of a given group|  Test(s) | 
|FR36-getTransactionsByGroupByCategory-return all transactions of all users of a given group, filtered by a given category|   Test(s) | 
|FR37-deleteTransaction-delete a given transaction|   Test(s) | 
|FR38-deleteTransactions-delete many transactions|   Test(s) | 

|FR40-Manage categories||
|-----------------------|---------|
|FR41-createCategory-create a new category |   Test(s) | 
|FR42-updateCategory-modify existing category|   Test(s) | 
|FR43-deleteCategory-delete a given category|   Test(s) | 
|FR44-getCategories-list all categories|   Test(s) | 

## Coverage white box

Report here the screenshot of coverage values obtained with jest-- coverage 

