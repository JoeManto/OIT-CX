# Testing Plan for OIT-CX
#### Jared Teller and Joe Manto - 12/7/2019

# Introduction
For our project we decided to use Jest and the React Testing Library to perform our unit and system tests. We are planning on spiking the Enzyme testing utility to understand how we can t various parts of the DOM in our project. 

- **Jest**
is a JavaScript t runner that lets you access the DOM via jsdom. While jsdom is only an approximation of how the browser works, it is often good enough for testing React components. Jest provides a great iteration speed combined with powerful features like mocking modules and timers so you can have more control over how the code executes.

- **React Testing Library**
is a set of helpers that let you t React components without relying on their implementation details. This approach makes refactoring a breeze and also nudges you towards best practices for accessibility. Although it doesn’t provide a way to “shallowly” render a component without its children, a t runner like Jest lets you do this by mocking.

- **Enzyme** is a JavaScript Testing utility for React that makes it easier to t your React Components' output. You can also manipulate, traverse, and in some ways simulate runtime given the output.

- Each type of t will reference the stories appendix below

# Unit Tests

#### Extensiveness
- We plan on having unit tests for every backend function
- We also plan on having unit tests for all our frontend react components are not static

#### Frameworks
-	Jest
- 	React Testing Library
-  	Enzyme

#### Automation

- The tests will be fully automated inside of Jest.
- The tests will be executed by running a t script that is embedded in our projects

#### When to Unit Test
- Unit tests are ran before any code can be merged from the testing branch to the master branch.

#### Expected Results
- All tests show a passing status

#### Stories to be Unit Tested
- All stories

# System Tests

- Our system tests is the running of all unit tests. Our unit-tests will t the proper flow and state throughout our React components. 

#### Automation
- The tests will be fully automated inside of Jest.
- The tests will be executed by running a t script that is embedded in our projects

#### When to System Test
- A system t will be ran before any merges are made for the Git Master branch

#### Stories to be System Tested
- All stories



# Accessability Tests
#### Extensiveness
- We plan on applying accessability testing on all our React Components that will be rendered on any page

#### Frameworks
- 508 Checker by Formstack http://www.508checker.com/
- axe Chrome extension by deque: `https://www.deque.com/axe/`
    - The axe Chrome extension can scan for quick compliance changes that need to be made.
-  We will be coding with accessability in mind referencing the following page provided by React: `https://reactjs.org/docs/accessibility.html`

#### When to Accessability Test
- We will be testing the accessability of our website before any version is taken to production

#### Expected Results
- There should be no issues with accessability as our project is created for Western Michigan University and should be fully accessible by any employee hired.

#### Stories to be Accessability Tested
- 2, 3, 4, 5





# Usability

#### Extensiveness
- The coverage the usability t will cover the whole web app
#### When to Usability Test
- These usability t will be done by the client and by student employee on a 2 week basis

#### Expected Results
- The expected results are that the client finds improvements that will make the site more useable.

#### Stories to be Usability Tested
- All stories





# Compliance

#### Extensiveness
- Compliance testing will be conducted all throughout the front-end and backend
#### Frameworks/tool
- https://validator.w3.org/ (HTML)
- https://github.com/tc39/test262 (JS testing)

#### When to Compliance Test
- Compliance Testing will be ran at major milestone points in the project
#### Expected Results
- The expected results are that our project doesn't receive any warnings from the tools
#### Stories to be Compliance Tested
- All stories


# Security Tests
#### Extensiveness
- Security Tests will be ran for every part of the project that accepts user input or makes changes to the database. This way we can attempt to prevent Cross site scripting, SQL injections, and Security Misconfigurations.
#### Frameworks
- Penetration Testing Kit Chrome Extension - https://chrome.google.com/webstore/detail/penetration-testing-kit/ojkchikaholjmcnefhjlbohackpeeknd?hl=en-GB

#### When to Security Test
- Before code is put into production, we will use the penetration testing kit listed above to detect any vulnerabilities. 

#### Expected Results
- There should be no major security concerns when the app is live.

#### Stories to be Security Tested
- 1, 3, 4, 5



# Coverage Tests
#### Frameworks
- Jest
#### Automation
- The coverage tests are automatically tracked by Jest
- Use the command `npm t -- --coverage`
- We will be able to generate coverage report after every system t
#### When to Coverage Test
- These will be not ran but viewed after every system t on the project

#### Expected Results
- The expected results are to have close to 90% of the code tested
 the other 10% of code that isn't tested will be code that doesn't
 need tests such as static rendering components
#### Stories to be Coverage Tested
- All Stories



# Integration Tests
#### Extensiveness
- The extensiveness of the integration tests will cover every external actor that our project uses
such as our Mysql database...
#### Frameworks
- Jest
- Enzyme
#### Automation
- The tests will be fully automated inside of Jest.
- The tests will be executed by running a t script that is embedded in our projects

#### When to Integration Test
- Integration Tests will be ran when changes are made to the code that interacts with our external actors.
These tests will also be ran before any code is merged to the master branch (just like all tests).
#### Expected Results
- The expected result is all the integration tests pass
#### Stories to be Integration Tested
- All Stories



# Black Box Tests

#### Extensiveness
- We will be black box testing all major testing areas of the project (Unit, System, Acceptance, Integration, Usability, etc.). We will have the client do some of the black box testing as they will know what to expect, but not exactly what is going on behind the scenes (in code). 

#### When to Black Box Test
- We will be continuously black box testing throughout the projects development making use of the client. This will be done using t versions that have not yet gone live.

#### Expected Results
- Find random occurrences of bugs and other issues by getting new perspectives and use cases from this testing.

#### Stories to be Black Tested
- All Stories



# Acceptance Tests

#### Extensiveness
- The client will t all stories and make sure they are up to their expected standards.
#### When to Acceptance Test
- We will have the client acceptance t before go-live on the project.
#### Expected Results
- The client should be satisfied that all stories are working and performing as expected.
#### Stories to be Acceptance Tested
- All Stories



# Stories

0. Resolve all found bugs in the core. 

1. A supervisor will be able to login to a supervisor restricted part of the tool. 

2. A supervisor should be able to access a settings page. 

    - The settings page should have a setting to change smtp email password. 

        - The password change field should validate a new password. 

        - Validating the smtp password should be conducted by sending a t email. 

    - The settings page should have a setting to change the build’s environment variables. 

        - static environment variables shouldn’t be listed but, only variables that could be need change over time.  

    - The settings page should have a feature to modify the Mobile Help Desk Locations. 

        - Add / Remove locations list  

    - low priority manual switch to flush Helpdesk Customer data. 

3. A supervisor should have access to an intuitive database read and write page  

    - Database editing/viewing should be limited to ensure such changes doesn’t cause unexpected results. 

    - Data should be filterable by database tables and fields. 

    - Data should be able to be sorted on database fields. 

    - Page should have an export feature that allows data to be exported as a pdf report 

4. An admin should be able to look employee’s profile pages where recent employee actions are displayed along with actions to modify employee data or delete an employee. 

5. A smtp email client should be used as notifications. 

    - emails can be sent automatically when a student employee’s posted shift get picked up by another student employee. 

    - emails can be sent automatically when a student employee posts a shift. 

## References
    https://jestjs.io/docs/en/tutorial-react - Jest and React Tutorial

    https://reactjs.org/docs/testing.html - React Testing docs

    https://www.w3.org/WAI/ER/tools/ - Web accessability evaluation tools list