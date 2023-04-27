# Requirements Document - future EZWallet

Date: 20/04

Version: V2 - description of EZWallet in FUTURE form (as proposed by the team)

 
| Version number | Change |
| ----------------- |:-----------|
| 2.1 | add business model, stakeholders and personas |
| 2.2 | add use cases |
| 2.3 | add FRs and NFRs |


# Contents

- [Requirements Document - future EZWallet](#requirements-document---future-ezwallet)
- [Contents](#contents)
- [Informal description](#informal-description)
	- [Business Model](#business-model)
- [Stakeholders](#stakeholders)
- [Context Diagram and interfaces](#context-diagram-and-interfaces)
	- [Context Diagram](#context-diagram)
	- [Interfaces](#interfaces)
- [Stories and personas](#stories-and-personas)
- [Functional and non functional requirements](#functional-and-non-functional-requirements)
	- [Functional Requirements](#functional-requirements)
	- [Non Functional Requirements](#non-functional-requirements)
- [Use case diagram and use cases](#use-case-diagram-and-use-cases)
	- [Use case diagram](#use-case-diagram)
		- [Use case 1: Manage accounts (UC1)](#use-case-1-manage-accounts-uc1)
				- [Scenario 1.1: Register Account](#scenario-11-register-account)
				- [Scenario 1.2: Login](#scenario-12-login)
		- [Use case 2: Manage transactions (UC2)](#use-case-2-manage-transactions-uc2)
				- [Scenario 2.1: Create Transactions](#scenario-21-create-transactions)
		- [Use case 3, UC3: Manage Categories](#use-case-3-uc3-manage-categories)
			- [Scenario 3.1: Create a category](#scenario-31-create-a-category)
			- [Scenario 3.2: Retrieve categories](#scenario-32-retrieve-categories)
			- [Scenario 3.3: Edit a category](#scenario-33-edit-a-category)
			- [Scenario 3.4: Delete a category](#scenario-34-delete-a-category)
		- [Use case 4, UC4: Manage Family](#use-case-4-uc4-manage-family)
			- [Scenario 4.1: Create a family](#scenario-41-create-a-family)
			- [Scenario 4.2: Add member to the family](#scenario-42-add-member-to-the-family)
			- [Scenario 4.3: Remove member from the family](#scenario-43-remove-member-from-the-family)
		- [Use case 5, UC5: Statistics](#use-case-5-uc5-statistics)
			- [Scenario 5.1: Show statistics](#scenario-51-show-statistics)
			- [Scenario 5.2: Filter statistics](#scenario-52-filter-statistics)
- [Glossary](#glossary)
- [System Design](#system-design)
- [Deployment Diagram](#deployment-diagram)

# Informal description
EZWallet (read EaSy Wallet) is a software application designed to help individuals and families keep track of their expenses. Users can enter and categorize their expenses, allowing them to quickly see where their money is going. EZWallet is a powerful tool for those looking to take control of their finances and make informed decisions about their spending.

## Business Model
EZWallet is a free to use web application for users: they can be organized in groups to share transactions among all other members.
EZWallet is also available as a mobile application, but it is necessary to buy it directly from the Google Play or the App store. Cost is yet to be defined.  
EZWallet, with a partnership with Google Analytics, controls the user behavior to increase performances.


# Stakeholders

| Stakeholder name  | Description |
| ----------------- |:-----------:|
| User   |  Uses the system. There are different user profiles (see later). In our case it is formed by all the users of the application that are logged in the system and have access to the app |
| Software Developer | The developer writes the code. |
| Administrator | Has more functions available than normal users (e.g. getUsers()). |   
|Apple Store and Google Play | Platforms in which our app is going to be available. It includes  legal+quality requirements|
|Google Analytics | collects data from the website and the app to create reports |
|Competitors |Other apps to keep track of user expenses	|


# Context Diagram and interfaces

## Context Diagram
<!-- \<Define here Context diagram using UML use case diagram>
\<actors are a subset of stakeholders> -->

```plantuml
left to right direction
actor Administrator as a
actor User as b
actor "Google Play" as c
actor "Apple Store" as d
actor "Google Analtytics" as e

rectangle System #Yellow {
  (EzWallet) #LightBlue
  a -- (EzWallet)
  b -- (EzWallet)
  (EzWallet) -- c
  (EzWallet) -- d
  (EzWallet) -- e
}
```

## Interfaces
<!-- \<describe here each interface in the context diagram> -->
<!-- \<GUIs will be described graphically in a separate document> -->

| Actor | Logical Interface | Physical Interface  |
| ------------- |:-------------:| -----:|
| User | GUI with added functions: register, logIn/logOut, create categories, check expenses, add/remove transactions  |  PC (Screen and Keyboards) and Mobile Device |
| Administrator| GUI with additional functions to manage family accounts and settings | PC (Screen and Keyboards)and Mobile Phone |
| Apple Store | Internet link | [https://developer.apple.com/app-store-connect/](link) |
| Google Play | Internet link | [https://developers.google.com/android-publisher?hl=it#publishing](link) |
| Google Analytics | Internet link |  [https://developers.google.com/analytics/devguides/reporting/embed/v1/getting-started?hl=it](link) |

# Stories and personas
<!-- \<A Persona is a realistic impersonation of an actor. Define here a few personas and describe in plain text how a persona interacts with the system> -->

<!-- \<Persona is-an-instance-of actor> -->
**Persona 1: Budget-Conscious Shopper**  
Jenny is a single mother who works full-time and struggles to stay within her monthly budget. She has many bills to pay, including rent, utilities, and her daughter's tuition fees. Jenny finds it hard to track her expenses and often exceeds her budget in some categories, causing her stress and financial difficulties.  
By using EZWallet, Jenny can categorize her expenses making it easier for her to stay on track with her budget. Additionally, she can see insights of her expenses by opening the statistics section.


**Persona 2: Family Financial Manager**  
The Grahams are a family of four whose father, John, manages their finances. John works as an accountant and has a good understanding of how to manage their finances efficiently. His wife, Sarah, is a stay-at-home mom taking care of their young children.  
John uses EZWallet to keep track of their expenses related to groceries, bills, kids' activities, and much more. The software helps him to analyze their spending patterns and make informed decisions to manage their finances better. For instance, John can identify areas where they can cut back on expenses and save money by reducing grocery expenses while maintaining a healthy diet.


**Persona 3: Business Owner**  
The Joneses run a small tech startup that offers web development services. The company is growing, and they need to track their expenses to ensure profitability. David and Lisa are the founders and manage the business's finances.  
With EZWallet, David can categorize expenses related to supplies, travel, marketing, and organization departments. The software tracks expenses, and by analyzing spending patterns, the Joneses can make informed financial decisions and cut back on unnecessary expenses to increase profitability.


**Persona 4: Recent College Graduate**  
Emily is a recent college graduate who just started working at a tech company. After years of being in college, Emily is ready to establish healthy financial habits and avoid unwise spending. She wants to save some money, pay off her student loan, and invest in herself.  
By using EZWallet, Emily can track expenses and gain financial awareness. The software provides statistics related to her financial behavior, helping her to develop responsible spending habits, and test better habits earned by using EZWallet better.


**Persona 5: Retirement Planner**  
Mrs. Morris is a retirement planner who has been providing retirement planning services for over twenty years. She has vast experience in financial management and helps her clients make informed financial decisions to achieve their financial goals. Mrs. Morris has a diverse clientele, including individuals, families, and small business owners.  
Mrs. Morris uses EZWallet to keep track of her clients' expenses, analyze spending patterns, and provide personalized financial advice. The software helps her to make accurate retirement planning recommendations based on her clients' financial habits and goals. By using EZWallet, Mrs. Morris ensures her clients are on track to meet their financial goals and live comfortably in retirement.


**Persona 6: Freelance Creative**  
Sophie is a freelance graphic designer who works on a per-project basis. She has several clients and needs to keep track of her income, expenses, and taxes. Sophie also wants to analyze her spending patterns to increase income and reduce expenses.  
EZWallet is an excellent tool for Sophie to keep track of her income, categorize expenses, and set spending limits. Sophie can also analyze spending patterns and make informed decisions to run her business more efficiently.


**Persona 7: Family Vacation Planner**  
Tom and Emily are a married couple who enjoy traveling with their three children. As a family vacation planner, Emily is responsible for planning and budgeting their vacations. She needs to keep track of their vacation expenses, including transportation, accommodation, food, and activities.  
EZWallet can help Emily categorize the family's vacation expenses providing her more control over the vacation budget. Emily uses the software to analyze her family's vacation spending patterns and make informed decisions to plan her trip efficiently.


**Persona 8: College Student**  
Joe is a college student who just started his freshman year at a university. He's staying in a dorm room and on a meal plan, which makes it easy to track his living expenses. However, Joe still spends money on clothes, entertainment, textbooks, and other miscellaneous items.  
By using EZWallet, Joe can track his expenses and categorize his purchases. The software will also provide Joe with insights into his spending habits, allowing him to make wise decisions with his remaining funds while keeping his budget under control.


**Persona 9: Busy Entrepreneur**  
Jessica is an entrepreneur who runs her company from home. She's extremely busy and sometimes forgets to track her expenses each day. Jessica needs a tool that can help her track expenses efficiently and remind her to categorize her purchases.  
EZWallet works well for Jessica, allowing her to quickly categorize her expenses and set custom reminders to track her expenses regularly. The software will also capture data on spending patterns, enabling Jessica to identify areas to save costs and help her run her business more efficiently.

<!-- \<stories will be formalized later as scenarios in use cases> -->


# Functional and non functional requirements

## Functional Requirements

<!-- \<In the form DO SOMETHING, or VERB NOUN, describe high level capabilities of the system> -->

<!-- \<they match to high level use cases> -->

| ID    	| Description  |
|---|---|
|  **FR1**  | Manage accounts (**) |
|  FR1.1    |  Register account |
|  FR1.2    |  Login |
|  FR1.3    |  Logout |
|  FR1.4    |  Authorize |
|  FR1.5    |  Delete Account |
|  FR1.6    |  Edit Account |
|  FR1.7    |  Add profile picture |
| **FR2**  | Manage transactions |
| FR2.1  | Create transactions |
| FR2.2  | Get transactions |
| FR2.3  | Delete transactions |
| FR2.4  | Filter transactions |
| FR2.4.1| Filter by User|
| FR2.4.2| Filter by Type|
| FR2.4.3| Filter by Date|
| FR2.5  | Edit transactions |
| FR2.6  | Sort transactions |
| FR2.6.1  | Sort by transaction name |
| FR2.6.2  | Sort by date |
| FR2.6.3  | Sort by amount |
| FR2.6.4  | Sort by category name |
| **FR3**  | Manage categories |
| FR3.1  | Create categories |
| FR3.2  | Get categories |
| FR3.3  | Edit category |
| FR3.4  | Delete category |
| **FR4**  | Manage Family |
| FR4.1 | Create Family |
| FR4.2 | Add member |
| FR4.3 | Delete member |
| FR4.4 | Generate Admin (*) |
| FR4.5 | Delete Family |
| FR4.6 | Get Users|
| **FR5** | Statistics |
| FR5.1 | Show statistics |
| FR5.2 | Filter statistics |


>>(*) When family is created, the admin is the one that has more functions available to manage the group of users (add member, get list of members, and delete family)
>>(**) manage users refers to all account management functionalities that the user can realize.


## Non Functional Requirements

<!-- \<Describe constraints on functional requirements> -->

| ID        | Type (efficiency, reliability, ..)           | Description  | Refers to |
| ------------- |:-------------:| :-----:| -----:|
| NFR1  | Usability  | Core functions for users (read transactions), should be used with no training by all users with at least 1yr experience with browsers and smartphones| All FRs |
| NFR2  | Availability |  99.9% uptime | - |
| NFR3  | Efficiency| All functions should be completed in 0.5s | All FRs |
| NFR4  | Security|  Access only to authorized users | FR 1.4 |
| NFR5  | Maintainability |The facility to  modify software components,  to correct faults, improve performance  or to adapt to a changed environment. For measures, refer to `EstimationV2.md` | All FRs |
| NFR6  | Portability | Effort to redeploy application on other platforms (> android 11, > iOS 11, > iPadOs 2) and , browser compatibility: javascript support (all recent versions). <br> Distribution channel: PlayStore, AppStore, Internet| - |
| NFR7  | Correctness | Capability to provide intended functionality in all cases (**no error** while querying the database, shows **only required data**). | All FRs |



# Use case diagram and use cases
## Use case diagram

```plantuml
actor User
actor Admin

User -- (FR1: Manage Accounts)
User -- (FR2: Manage Transactions)
User -- (FR3: Manage Categories)

User -- (FR5: Statistics)

Admin -- (FR4: Manage Family)
Admin --|> User
```

### Use case 1: Manage accounts (UC1)
| Actors Involved        | User or Admin|
| ------------- |:-------------:|
|  Precondition     | User has installed the EZWallet application |
|  Post condition     | User's account is managed |
|  Nominal Scenario     | User registers, logs in, logs out, authorizes, edits, deletes, and adds a profile picture |
|  Variants     | N/A |
|  Exceptions     | Invalid account credentials, network errors, invalid image format for profile picture |

##### Scenario 1.1: Register Account
| Scenario 1.1 | |
| ------------- |:-------------:|
|  Precondition     | User has not registered an account |
|  Post condition     | User's account is registered |
| Step#        | Description  |
|  1     | User launches the EZWallet application |
|  2     | User selects "Register" |
|  3     | User fills in the required information (email, password, name) |
|  4     | User submits the registration form |
|  5     | System creates the new account and stores it in the database |
|  6     | User receives a confirmation message |

##### Scenario 1.2: Login
| Scenario 1.2 | |
| ------------- |:-------------:|
|  Precondition     | User has a registered account |
|  Post condition     | User is logged in |
| Step#        | Description  |
|  1     | User launches the EZWallet application |
|  2     | User enters their email and password |
|  3     | User selects "Login" |
|  4     | System validates the user's credentials |
|  5     | System logs the user in and displays the main screen |

### Use case 2: Manage transactions (UC2)
| Actors Involved        | User |
| ------------- |:-------------:|
|  Precondition     | User is logged in |
|  Post condition     | User's transactions are managed |
|  Nominal Scenario     | User creates, gets, deletes, filters, edits, and sorts transactions |
|  Variants     | N/A |
|  Exceptions     | Invalid transaction data, network errors |

##### Scenario 2.1: Create Transactions
| Scenario 2.1 | |
| ------------- |:-------------:|
|  Precondition     | User is logged in and wants to create a new transaction |
|  Post condition     | New transaction is created and added to the user's transaction list |
| Step#        | Description  |
|  1     | User navigates to the "Transactions" section |
|  2     | User selects "Create Transaction" |
|  3     | User fills in the required transaction information (type, amount, category, date) |
|  4     | User submits the transaction form |
|  5     | System creates the new transaction and stores it in the database |
|  6     | User receives a confirmation message and the transaction is added to the list |

### Use case 3, UC3: Manage Categories
| Actors Involved        | User or Admin |
| ------------- |:-------------:|
|  Precondition     | User is logged in and has access to the categories section |
|  Post condition     | Category is created, retrieved, edited, or deleted based on user action |
|  Nominal Scenario     | 1. User selects to create, retrieve, edit, or delete a category. 2. User provides necessary input for the chosen action. 3. System processes the request and updates the category list accordingly. 4. User receives a confirmation message regarding the success of the operation. |
|  Variants     | None |
|  Exceptions     | 1. User provides invalid input for the chosen action.  2. System fails to process the request.  3. User tries to delete a category with active transactions. |

#### Scenario 3.1: Create a category
| Scenario 3.1 | |
| ------------- |:-------------:|
|  Precondition     | User is logged in and has access to the categories section |
|  Post condition     | A new category is created and added to the user's category list |
| Step#        | Description  |
|  1     | User clicks on the "Create Category" button |  
|  2     | System displays a form to enter the category name and description |
|  3     | User fills in the required information and submits the form |
|  4     | System validates the input and creates the new category |
|  5     | System displays a confirmation message and adds the new category to the user's category list |

#### Scenario 3.2: Retrieve categories
| Scenario 3.2 | |
| ------------- |:-------------:|
|  Precondition     | User is logged in and has access to the categories section |
|  Post condition     | User views their existing categories |
| Step#        | Description  |
|  1     | User navigates to the categories section |
|  2     | System retrieves and displays the list of user's categories |

#### Scenario 3.3: Edit a category
| Scenario 3.3 | |
| ------------- |:-------------:|
|  Precondition     | User is logged in and has access to the categories section, with at least one category present in the list |
|  Post condition     | The selected category is updated with the new information provided by the user |
| Step#        | Description  |
|  1     | User selects a category from the category list |
|  2     | User clicks on the "Edit Category" button |
|  3     | System displays a form with the existing category information |
|  4     | User modifies the information as needed and submits the form |
|  5     | System validates the input and updates the category information |
|  6     | System displays a confirmation message and updates the category list |

#### Scenario 3.4: Delete a category
| Scenario 3.4 | |
| ------------- |:-------------:|
|  Precondition     | User is logged in and has access to the categories section, with at least one category present in the list |
|  Post condition     | The selected category is removed from the user's category list |
| Step#        | Description  |
|  1     | User selects a category from the category list |
|  2     | User clicks on the "Delete Category" button |
|  3     | System prompts the user for confirmation |
|  4     | User confirms the deletion |

### Use case 4, UC4: Manage Family
| Actors Involved        | Admin  |
| ------------- |:-------------:|
|  Precondition     | User is logged in and has access to the family management section |
|  Post condition     | Family is created, member added or removed, admin is generated, or family is deleted based on user action |
|  Nominal Scenario     | 1. User selects to create, add or remove a member, generate admin, or delete a family.  2. User provides necessary input for the chosen action.  3. System processes the request and updates the family list accordingly.  4. User receives a confirmation message regarding the success of the operation. |
|  Variants     | None |
|  Exceptions     | 1. User provides invalid input for the chosen action.  2. System fails to process the request. |

#### Scenario 4.1: Create a family
| Scenario 4.1 | |
| ------------- |:-------------:|
|  Precondition     | User is logged in and has access to the family management section |
|  Post condition     | A new family is created and the user is set as the family administrator |
| Step#        | Description  |
|  1     | User clicks on the "Create Family" button |  
|  2     | System displays a form to enter the family name and description |
|  3     | User fills in the required information and submits the form |
|  4     | System validates the input and creates the new family |
|  5     | System sets the user as the family administrator |
|  6     | System displays a confirmation message and adds the new family to the user's family list |

#### Scenario 4.2: Add member to the family
| Scenario 4.2 | |
| ------------- |:-------------:|
|  Precondition     | User is logged in, has access to the family management section, and is the family administrator |
|  Post condition     | A new member is added to the family |
| Step#        | Description  |
|  1     | Admin selects the family in the family list |
|  2     | Admin clicks on the "Add Member" button |
|  3     | System displays a form to enter the new member's email address |
|  4     | Admin fills in the email address and submits the form |
|  5     | System validates the input and sends an invitation to the new member |
|  6     | New member accepts the invitation |
|  7     | System adds the new member to the family and displays a confirmation message |

#### Scenario 4.3: Remove member from the family
| Scenario 4.3 | |
| ------------- |:-------------:|
|  Precondition     | User is logged in, has access to the family management section, and is the family administrator |
|  Post condition     | A member is removed from the family |
| Step#        | Description  |
|  1     | Admin selects the family in the family list |
|  2     | Admin selects the member to be removed |
|  3     | Admin clicks on the "Remove Member" button |
|  4     | System prompts the admin for confirmation

### Use case 5, UC5: Statistics
| Actors Involved        | User or Admin |
| ------------- |:-------------:|
|  Precondition     | User is logged in and has access to the statistics section |
|  Post condition     | Statistics are displayed or filtered based on user action |
|  Nominal Scenario     | 1. User selects to view or filter statistics.  2. User provides necessary input for the chosen action.  3. System processes the request and updates the statistics display accordingly.  4. User views the statistics based on their request. |
|  Variants     | None |
|  Exceptions     | 1. User provides invalid input for the chosen action.  2. System fails to process the request. |

#### Scenario 5.1: Show statistics
| Scenario 5.1 | |
| ------------- |:-------------:|
|  Precondition     | User is logged in and has access to the statistics section |
|  Post condition     | User views their financial statistics |
| Step#        | Description  |
|  1     | User navigates to the statistics section |
|  2     | System retrieves and displays the user's financial statistics |

#### Scenario 5.2: Filter statistics
| Scenario 5.2 | |
| ------------- |:-------------:|
|  Precondition     | User is logged in and has access to the statistics section |
|  Post condition     | User views the filtered financial statistics based on the applied filters |
| Step#        | Description  |
|  1     | User navigates to the statistics section |
|  2     | User clicks on the "Filter" button |
|  3     | System displays a filter form with various filtering options |
|  4     | User selects the desired filters and submits the form |
|  5     | System retrieves and displays the user's financial statistics based on the applied filters |

# Glossary

<!-- \<use UML class diagram to define important terms, or concepts in the domain of the application, and their relationships>  -->

<!-- \<concepts must be used consistently all over the document, ex in use cases, requirements etc> -->

```plantuml
class Statistic {
+ Type
}

class Category {
+ Type
+ Colour
}

class Transactions {
+ Name
+ Type
+ Amount
+ Date
}

class User {
+ Username
+ Password
+ Email
+ Profile pictur
+ Member of family
}

class Family {
+ Number of members
+ List of members
}

Transactions "*" -- Category
Statistic "1..*" -- Transactions
User -- "*" Transactions
User --|> Family
Admin --|> User
Admin --|> Family
```


# System Design
<!-- \<describe here system design>
\<must be consistent with Context diagram> -->

```plantuml
class EzWallet #Yellow 
class "EzWallet Client" #Orange 
class "EzWallet Server" #Orange
class "Android Device" #LightBlue
class "IOS/iPadOS Device" #LightBlue
class "PC" #LightBlue
class "Web server" #LightBlue
class "DBServer" #LightBlue
class "Android app" #LightGreen
class "IOS/iPad OS app" #LightGreen
class "Browser" #LightGreen
class "MongoDB" #LightGreen

EzWallet o-- "1..*" "EzWallet Client"
  "EzWallet Client" <|-- "Android Device"
    "Android Device" <|.. "Android app"
  "EzWallet Client" <|-- "IOS/iPadOS Device"
    "IOS/iPadOS Device" <|.. "IOS/iPad OS app"
  "EzWallet Client" <|-- "PC"
    "PC" <|.. "Browser"
EzWallet o--  "EzWallet Server"
  "EzWallet Server" <|-- "Web server"
  "EzWallet Server" <|-- "DBServer"
    "DBServer" <|.. "MongoDB"
note bottom of "Web server" #LightGray: Node.js, React
```

# Deployment Diagram 
<!-- \<describe here deployment diagram > -->

```plantuml
node "EzWallet Server" #LightYellow
node "Android Device" #LightYellow
node "IOS/iPadOS Device" #LightYellow
node "PC client" #LightYellow
node "Distribution" #LightYellow
node "Analytics" #LightYellow


artifact "Browser" #LightBlue
artifact "Android app" #LightBlue
artifact "IOS/iPad OS app" #LightBlue
artifact "Web server" #LightBlue
artifact "DBServer" #LightBlue
artifact "Google Play" #LightBlue
artifact "Apple Store" #LightBlue
artifact "Google Analytics" #LightBlue

"EzWallet Server" -left- "internet link" "PC client"
"EzWallet Server" -down- "internet link" "Android Device"
"EzWallet Server" -down- "internet link" "IOS/iPadOS Device"
"EzWallet Server" -down-- "internet link" "Distribution"
"EzWallet Server" -right-- "internet link" "Analytics"

"PC client" <.. "Browser"
"Android Device" <.. "Android app"
"IOS/iPadOS Device" <.. "IOS/iPad OS app"
"Analytics" <.. "Google Analytics"
"Distribution" <.. "Google Play"
"Distribution" <.. "Apple Store"
"EzWallet Server" <.up. "Web server"
"EzWallet Server" <.up. "DBServer"

note bottom of "Browser" #LightGray: Compatible Browser
note bottom of "Android app" #LightGray: Supported versions of Operating System
note bottom of "IOS/iPad OS app" #LightGray: Supported versions of Operating System
note top of "DBServer" #LightGray: MongoDB (for users and transactions)
```
