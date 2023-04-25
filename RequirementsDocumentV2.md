# Requirements Document - future EZWallet

Date: 

Version: V2 - description of EZWallet in FUTURE form (as proposed by the team)

 
| Version number | Change |
| ----------------- |:-----------|
| | | 


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
		- [Use case 1, UC1](#use-case-1-uc1)
				- [Scenario 1.1](#scenario-11)
				- [Scenario 1.2](#scenario-12)
				- [Scenario 1.x](#scenario-1x)
		- [Use case 2, UC2](#use-case-2-uc2)
		- [Use case x, UCx](#use-case-x-ucx)
- [Glossary](#glossary)
- [System Design](#system-design)
- [Deployment Diagram](#deployment-diagram)

# Informal description
EZWallet (read EaSy Wallet) is a software application designed to help individuals and families keep track of their expenses. Users can enter and categorize their expenses, allowing them to quickly see where their money is going. EZWallet is a powerful tool for those looking to take control of their finances and make informed decisions about their spending.

## Business Model
EZWallet is a free to use web application for users: they can be organized in groups to share transactions among all other members.
Also, EZWallet is available as a mobile application with a pay-to-use license. Cost is yet to be defined.
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
\<Define here Context diagram using UML use case diagram>

\<actors are a subset of stakeholders>

## Interfaces
\<describe here each interface in the context diagram>

\<GUIs will be described graphically in a separate document>

| Actor | Logical Interface | Physical Interface  |
| ------------- |:-------------:| -----:|
|   Actor x..     |  |  |

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

\<In the form DO SOMETHING, or VERB NOUN, describe high level capabilities of the system>

\<they match to high level use cases>

| ID        | Description  |
| ------------- |:-------------:| 
|  FR1     |  |
|  FR2     |   |
| FRx..  | | 

## Non Functional Requirements

\<Describe constraints on functional requirements>

| ID        | Type (efficiency, reliability, ..)           | Description  | Refers to |
| ------------- |:-------------:| :-----:| -----:|
|  NFR1     |   |  | |
|  NFR2     | |  | |
|  NFR3     | | | |
| NFRx .. | | | | 


# Use case diagram and use cases


## Use case diagram
\<define here UML Use case diagram UCD summarizing all use cases, and their relationships>


\<next describe here each use case in the UCD>
### Use case 1, UC1
| Actors Involved        |  |
| ------------- |:-------------:| 
|  Precondition     | \<Boolean expression, must evaluate to true before the UC can start> |
|  Post condition     | \<Boolean expression, must evaluate to true after UC is finished> |
|  Nominal Scenario     | \<Textual description of actions executed by the UC> |
|  Variants     | \<other normal executions> |
|  Exceptions     | \<exceptions, errors > |

##### Scenario 1.1 

\<describe here scenarios instances of UC1>

\<a scenario is a sequence of steps that corresponds to a particular execution of one use case>

\<a scenario is a more formal description of a story>

\<only relevant scenarios should be described>

| Scenario 1.1 | |
| ------------- |:-------------:| 
|  Precondition     | \<Boolean expression, must evaluate to true before the scenario can start> |
|  Post condition     | \<Boolean expression, must evaluate to true after scenario is finished> |
| Step#        | Description  |
|  1     |  |  
|  2     |  |
|  ...     |  |

##### Scenario 1.2

##### Scenario 1.x

### Use case 2, UC2
..

### Use case x, UCx
..



# Glossary

\<use UML class diagram to define important terms, or concepts in the domain of the application, and their relationships> 

\<concepts must be used consistently all over the document, ex in use cases, requirements etc>

# System Design
\<describe here system design>

\<must be consistent with Context diagram>

# Deployment Diagram 

\<describe here deployment diagram >




