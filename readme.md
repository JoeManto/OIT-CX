# OIT-CX
Full-stack ReactJS app focused on streamlining employee shift management and customer relations.

``https://shifts.it.wmich.edu/``

<!--ts-->
  * [General Info](#General-Info)
  * [Contribution Details](#Contribution-Details)
    * [Environment Setup for Team Members](#Environment-Setup-for-Team-Members)
    * [Programming Standards](#Programming-Standards)
    * [Version Control Standards and Guidelines](#Version-Control-Standards-and-Guidelines)
    * [Jest Testing Standards for OIT-CX](#Jest-Testing-Standards-for-OIT-CX)
<!--te-->

General Info
=====
**Infomation is subject to change because of a future planned effort to provide a more intitive way of starting the project for the first time**

#### After Cloning
If you trying to start a development build please modify the environment variables and the server `config-file` which holds variables like database host addresses and ldap host, root passwords ..etc (More on this below)

#### Running a local development build
To run a development build for contributing or testing whether your config settings are correct can be done by running the following commands.

- `npm install` (If you haven't already)

- `npm start &`

  This will start the local react developed server on localhost:3000

- `node Server/server.js`

  This will start the backend server for which the proxy is already set up

#### Deploying a production build with docker

Deploying a production build with docker is very easy. First thing you need to do is confirm that the exposed http port in the `dockerFile` is the same as in `server.js`.

> **Server.js** - Changing the http port
```javascript
let server = https.createServer(sslOptions, app);
server.listen(443, () => {
    console.log("server starting on port : " + 443)
});
```

> **Server.js** - Changing Certificate
```javascript
const sslOptions = {
    key: fs.readFileSync(__dirname + '/ssl/selfsigned.key'),
    cert: fs.readFileSync(__dirname + '/ssl/selfsigned.crt');
};
```

once all config editing is finished we need to build the production version of our react build.

- `npm run build`

This will turn our React development files into static js chunks which can be found in the newly created directory `build`. Next we need to modify our server to statically serve the build folder.

> **Server.js** - Switch to serving static files
```javascript
    app.use(express.static(path.join(__dirname, '../build')));
    app.get('/*', function(req, res) {
        res.sendFile(path.join(__dirname, '../build', 'index.html'));
    }); 
```


more info can be found here https://create-react-app.dev/docs/deployment

you can now start your docker container. Run the docker container
which will start 3 services the Mysql Database and the Node/express server, and adminer with the following command.

- `docker-compose up --build`

**Contribution Details**
======
**Environment Setup for Team Members**
======

Before getting into any setup it is highly suggested that new team members take a look at all of the references and coding standards. References can be found in: `References/references.md` and programming standards can be found in: `Standards/ProgrammingStandards.md` 

## IDE Setup
We decided on using Visual Studio Code (VS Code) as our IDE. To use the built in terminal (CTRL+~) we used git bash for windows versions and a regular bash terminal for Unix environments.
The following standards should be followed:
- Tab spacing set to 4
- CRLF line endings
- UTF-8 character set
- Block Comments Package/Extension should be installed 

#### Example of Block Comment Format
This will provide universal comments for functions
```javascript
    Ex. 
    /**
    * @param {type} parameter
    * ...
    */
    Function(args){...}
```

Within this IDE we also used a Pair programming feature that should be utilized as much as possible: VS Code Live Share.
To set up Live Share it must be installed as an extension in VS Code. This feature allows for real time pair programming.

## Cloning from Github
To clone the project from Github the following commands should be used from the terminal: 

`git clone https://github.com/JoeManto/OIT-CX.git`

This command will copy the public project in a directory in your current working directory.

## Add Server Configuration File
This file is store locally by a team member as it contains sensitive passwords for ldap and smtp. You will have get this file from a teammate
You will need to place this file in `Server/`. This file is very important as it is imported by many modules throughout the server to provide easy access to database,ldap-auth,smtp configs.

Notice that this file is just a JS file that exports JS objects.

## Installing All Project Dependencies 
We need to make sure we have Node 8+ installed in the environment. To do so go to the following link for instructions for your OS: [Install Guide](https://nodejs.org/en/download/)

Before we install dependencies we need to make sure that the npm package manager has up to date packages.
Run `npm update -g npm` to update Npm. This will update the underlining program to grab the most up to date packages.


This will install all the project dependencies that are referenced in package.json 
`npm install`

Notice now a `node_modules` directory will now appear in the root directory. This directory contains all the API's for the dependencies that we just installed. This directory also should never be pushed to the the remote repository as this file is really large.

All **new** dependencies need to be spiked and reviewed by all team members before they can be merged and used throughout the project.

## Installing MySQL
To install MySQL version 5.11 go to the following link: [Install Guide](https://dev.mysql.com/doc/refman/8.0/en/windows-installation.html)

## Setting up a superuser in Mysql
A super user in MySQL is necessary to create the appropriate Tables needed by the project. To create a superuser in MySQL follow this guide: [MySQL Guide](https://tableplus.com/blog/2018/10/how-to-create-a-superuser-in-mysql.html)

or run these commands in a unix terminal. If on windows then use the Mysql Command Line Program and skip to command 2. 

`mysql -u root -p`

Notice that you will be prompted for a password. This is the password that was set when mysql was installed.

`GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' IDENTIFIED BY 'password';`

## Setting up MySQL Tables
- A database will need to be created that is called `nodemysql`. This can be done with the following command in MySQL within a terminal: 

    `CREATE DATABASE nodemysql;`

- Next, locate the sqldump.sql file within the server directory. 
Run the following: 

    `mysql -u root -p nodemysql < sqldump.sql`.

- The tables should now be set up.

**Programming Standards**
===
The following Programming Standards must be followed by all Team Members:

## General Standards

#### Naming Conventions
- All function names and local variables must use the camelCase naming convention e.g. `function doSomething()`
- All class names and global variables must have the first character capitalized eg `class Solution{...}`
- Constants should be named in all capital letters e.g `CONSTDATA`
- Try to avoid digits within variable names
- All names should be descriptive and meaningful and represent what that variable or function is doing. e.g. `function addTwoInts(a, b)` rather than `function add(a, b)`
- All functions should be visible within one viewing window at standard zoom in visual studio code
    - If a function is larger than this it should be split into smaller functions
 - Variables should not be one character other than indexing variables

#### Indentation and Characters
- Tab spacing set to 4
- CRLF line endings
- UTF-8 character set
- Block Comments Package/Extension should be installed in visual studio code
- Use of white space should be as follows:
    - Use a space after a comma when separating function arguments e.g. `function doSomething(arg1, arg2)`
    - Every nested block of code should be one indent further than the previous

## ReactJS Standards

- Try to follow all of **ReactJS Design Principles**. These can be found at the following link: [Design Principles](https://reactjs.org/docs/design-principles.html)
- Any react component that doesn't rely on multiple states should be a simple React component function
-   All React Components functions/classes definitions should start and follow with a capitalized first character for each word
- Components should have a relatively small foot printing. Meaning they should one not be very large and too solve or implement a small feature (see nested Components)

#### Nested Components
Nested components should be used rather than passing in jsx through props in most cases
ex.

- **What not to do**
```javascript
    <TwoColumn left = {[<div>LEFT SIDE</div>]} right = {[<div>Right</div>]} />
```
- **What should be used**
```javascript
    <TwoColumn>
        <div>LEFT SIDE</div>
        <div>RIGHT SIDE</div>
    <TwoColumn>
```
#### React Function Component
Here is an example of what a ES6 React component function should look like.
All react component functions and inner class functions follow ES6 syntax.
-   return JSX only
```javascript
    let Frame = (props) => {
        let {name,lastname} = props
        return (
            //jsx
            <div>{name}{lastname}</div>
        )
    }
```
#### React Class Component
Here is an example of what a React Class Component should look like.
```javascript
    class Frame extends React.Component{
        constructor(props){
            super(props);

            //state goes here
            this.state = {
                value:3,
                ...
            }
        }
        render() return();
    }
```
#### Props Destruction
Prop Destructuring is the process of converting a js object's inner hash table key value pairs into individual local scoped variables.
Prop Destructuring should be used always when there are > 1 number of props.
This allows props to be referenced by name rather than using the root reference from props first.
This process has little impact on performance and is mainly used for readability.

**Prop Destruction in React Functions**
```javascript
    let Frame = (props) => {
        //Props Destructuring
        let {name,lastname} = props
        return (
            //jsx
            <div>{name}{lastname}</div>
        )
    }
```

**Prop Destruction in React Classes**

The process is almost the same as React functions, but instead of destructing to individual variables we just append the hash table from the props object to the class's inner hash table.

Prop destructuring in React classes should only be done in the constructor
of the class in question. It also should be the first thing that is done in the constructor to prevent 
from future errors from a function using pre-destruction references.

```javascript
    class Frame extends React.Component{
        constructor(props){
            super(props);
            
            /*  [Props Destructuring]
            * - this | Frame reference
            * - {props} | Outer Destruction
            * - ['props'] | stealing the hash table
            */
            Object.assign(this,{props}['props']);
            ...
        }

        render(){
            return <div>{this.lastname}</div>
        }
    }
```

#### References
No DOM element should be referenced out side of the React API.
`Document.getElementBy...` should not be used at all as it interferes with the React API.
All element references should be done using React refs in components. (overkill example below)

```javascript
    class Frame extends React.Component{
        constructor(props){
            super(props);

            this.link = React.CreateRef();

            this.clickLink = this.clickLink.bind(this);
        }

        clickLink = () => {
            this.link.current.click();
        }

        render(){
            return(
                <div onClick = {()=>{this.clickLink()}}>
                    <a href = "" ref = {this.link}>
                </div>
            )
        }
    }
```
Notice that a reference is attached to the anchor tag and that reference is used to simulate a click on the anchor when the outside div is 'clicked'

#### Rendering Inline Conditional Statements
Any conditional statements in the render method should only compare changing state values and not any other global variables
```javascript
    Class Frame extends React.Component{
        ...
        render(){
            let state = this.state;
            //One if
            {state.somevalue === 1 &&
                <div>Render Option 1</div>
            }

            //If else
            {state.somevalue === 2 ? 
            (
                <div>Render Option 2</div>
            ):
            (
                <div>Not 2</div>
            )}

            //nested if else
            {this.state.firstRender 
            ? null 
            : ( !this.state.closed ? 
                    this.animateMenu(this.links,"up") : this.animateMenu(this.links,"down")
              )
            }
        }
    }
```

#### React Styling
Follows the normal CSS styling conventions 
Styles that are local to a component should be implemented as javascript object styling. In line style in the jsx block

**Javascript Object Styling**
define all the styling in the render method of the class component or use css modules 
```javascript
    render(){
        const divStyle = {
            backgroundColor:'#333',
        }

        return (
            <div style = {divStyle}/>
        )
    }
```

**Inlining to not use**
```javascript
    render(){
        return (
            <div style = {"background-color:#333"}/>
        )
    }
```
**Correct Inlining to use**

use camel case js style 
```javascript
    render(){
        return (
            <div style = {{backgroundColor:"#333"}}/>
        )
    }
```

## ES6+ and Babel
---
All JS based code in both the backend and in the React frontend should follow and use all ES6 Concepts. See: [ES6 Reference](http://es6-features.org/#Constants)

Such Concepts that should be followed are [Spreading Syntax (Array and Object referencing), Arrow Functions, Arrays.map, Arrays.filter] 

Spread Syntax Example - from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax:
```Javascript
function sum(x, y, z) {
  return x + y + z;
}

const numbers = [1, 2, 3];

console.log(sum(...numbers));
// expected output: 6

console.log(sum.apply(null, numbers));
// expected output: 6
```

JavaScript Array Filtering Example - from: https://www.geeksforgeeks.org/javascript-array-filter/:
```JavaScript
function isPositive(value) {
  return value > 0;
}

var filtered = [112, 52, 0, -1, 944].filter(isPositive);

//JavaScript Arrow Function Example
var filtered = [112, 52, 0, -1, 944].filter(x =>{return x > 0});

print(filtered);

Output: [112, 52, 944]
```

## NodeJS

All code in the backend should follow all the programming standards listed above in ES6.

**Any backend service should be ideally separated as a child processes**
-   The main thread is reserved for REST API Requests
-   A child process should only use a small amount of resources

## CSS Standards

#### General
- Always try to provide fallback properties for older browsers if they are known to be available
- Do not use comments unless the rule specified is unclear at first glance e.g. Some kind of workaround

#### Formatting
- Put spaces before `{` in rule declarations
- Use either hex color codes like `#000` or rgba()
- Follow each CSS rule with a line of whitespace e.g. 
- Use camelCase for all rule names
- Use a space after every `:` inside a rule

Putting these all together will yield the following:
```CSS
#item1 {
    color: #333
}

.selectedItem {
    color: #fff;
    display: block;
}

.testingClass {
    border-radius: 5px;
    background-color: rgba(255,0,0,0.3);   
}
```

**Version Control Standards and Guidelines**
=====
> <span style = "font-weight:bold;line-height:40px;">Below are all the respected standards and guidelines that must be followed through out the development of this project.
The standards and guidelines will explain the proper ways to use git throughout all the know procedures that the team uses. It's Important that every team member follows these to ensure the code base has no concurrency issues with commits ...etc</span>

## Git Usage
----
Git was chosen as the Version Control tool for this project. This will allow the team to create separate branches for new features, testing and also allow for easy viewing of the file differences which is used as a tool for code review before any merges are made to the **merge restricted branches**. The online hosting service Github was also chosen for the hosting of the project files for the team. The team public repo can be found at the following link: [OIT-CX Github](https://github.com/JoeManto/OIT-CX). (See General Commands for retrieving the project)

* **Merge Restricted Branch** : A branch that only allows commits from the lead contributor or contributor's

## Starting Commands
----
To initialize the Repository use one of the two commands can be used
```bash
git init \

git remote add origin https://www.github.com/joemanto/OIT-CX \

git pull origin master \
```
**or**

To directly cloning the repository, use this command
```bash
//clone
git clone https://www.github.com/joemanto/OIT-CX
```
## Branching & Merging
----


### Branching
When starting a new feature or sub-feature, a branch can be created from the testing branch or a from a sub branch from testing. 

* Sub-feature branching is not required, but is used throughout the project. 

* Feature branching from the testing branch is required. 

**Branching from testing**

```bash
git checkout testing

git branch <branchname>
```

**Branching from sub branch**

```bash
git checkout <subbranch>

git branch <branchname>
```

### Merging

- Before any code can be merged to master the following must be done
    - All server and frontend side tests should all pass

    - All code has to be development and pushed to the testing branch before the code can be pushed to the master branch
    - All code should go through a code review with another team member
    (see code review section)
 


* A sub-feature branch is only allowed to be merged back up to the root feature branch. No Higher 

* A feature branch is only allowed to be merged to testing. No Higher

**Merging to master**

Testing branch merging will be handled by the lead contributor's via Github pull requests from team members

**or**

lead contributor's can merge after code review by the following commands
```bash
    git checkout master

    git merge testing
```

**Merging to testing**

```bash
    git checkout testing

    git merge <feature-branch-name>
```


## Commits
----
**All commits should** 
* have small file differences and only contain file differences that relate to the context of the commit that is bring created.
* have a detailed message or paragraph that explain the insertions and deletions.
  follow this guide for [writing commit messages](https://medium.com/@steveamaza/how-to-write-a-proper-git-commit-message-e028865e5791)

**Don't directly push to the master branch**
This practice allows for possible inconsistencies throughout the code base and could result in merge conflicts or cause bugs because the new changes caused tests to fail.  

**Pushing to Branches**
```bash
git add -A 

# short message
git commit -m "message"

# or

# paragraph message
git commit 

git push <remote> <branch-name>
```
## Reverting
----
 If any code is pushed to the Master branch without being reviewed and tested (both unit and system tests), that push will be reverted and the project will be taken back to the most recent stable version. The code that follows will perform a rollback:
```bash
git push -f origin last_known_good_commit:branch_name
```
 To revert an individual commit that was either made by mistake or incorrect, perform the following:
```bash
git revert <commit hash>
```

## Code Review
----
 Before any major changes the team will need to engage in a short Pair Programming review session
 This can be done either in person, or in real time using Visual Studio Code Live Share.
 We opted for this since the team is small

-  In this code review the tests for the project will be ran before the code review starts.
    


## Pushing to Testing
----
All team members are allowed to push to the testing branch and everything lower without a code review. 
-   Features when completed and tested should then be pushed to the master branch after a code review

Allow the guide for pushing to branches in (Commits)


**Jest Testing Standards for OIT-CX**
====
The following guidelines and standards below will explain how, when, and where Server tests and React Component tests are conducted using

* **Jest**
* **jest-dom**
* **React Testing Library**
* **React Test Render**
## Unit Testing

Unit Tests need to be conducted for every finish Non-Static Html React component and every function should ideally should have a Jest test associated to it.

#### Unit Testing with Jest
-   All tests need to be in the directory named `__tests__`
    This folder name will allow jest to automatically find unit tests.
    Alternately, tests can have the file extension prefix `.test.js` which will also allow jest to spot tests. 
-   Example Jest test file name would be the following `spiketest1.test.js`

- The testing file should have the same file name prefix as the file that is being tested
- The testing file should not contain tests that are from unrelated files

#### Defining a Suite
A suite in Jest is simply a category name for all the tests in that suite and is denoted by the keyword `describe`
- For `Testing React Components` the suite name should be the component name
- For `Testing normal functions` the suite name should be the function name
- A suite should contain all the tests that are directly related to the element/function/class that is being tested

```javascript
    describe(('suite name'), () => {
        it('should ...', () => {
            ....assertion
        })
    })
```

#### Defining a Test
A test in Jest can be denoted by `it` or `test`. Jest tests can be done by using an expect combined with a matcher. Jest provides a whole list of matchers that test general logic conditions all the way up to DOM lookups. These Jest Assertions can be done by using the `expect()` with the element or value that are going to match.
then 

* The it keyword should be used
* The test name should start with "Should ..." as it provides a nice way of making sure unit test descriptions are easy to understand.

**Example Test with Jest**
```javascript
    const functions = {
        add: (num1, num2) => num1 + num2
    }

    describe('Add', () => {
        it('Should Add 2 + 2 to get 4', () => {
            expect(functions.add(2,2)).toBe(4);
        })

        it('Should Add 5 + 5 to not get 11', _ => {
            expect(functions.add(5,5)).not.toBe(11);
        })
    })

```

## Running Jest Unit Tests
The Jest unit tests can be ran using the command `jest`. Jest then takes a path to where you tests are found `jest path/to/tests`. 

    jest spikes

To run the unit tests for the frontend you run 

    npm test

this will run all the tests in the `src` directory, which holds all the react components.  

## System Testing
- System testing is automated through Jest by using a global call of jest. This can be done with the following command: 

    `jest` (in the root directory)

- This will search through the entire directory of the project and find any file with the extension `.test.js`.
The output will show the number of tests that were found and ran along with the number of them that passed.

- Snapshots can also be created for components using Jest (more on this later). All snapshots will also be ran using the `jest` command. 



## Coverage Testing
- We use jest to automatically generate coverage reports using the following command:</br>
`npm test -- --coverage`
```
Test Suites: 2 passed, 2 total
Tests:       2 passed, 2 total
 PASS  src/__tests__/JestSpike1.test..js
 PASS  src/__tests__/App.test.js
----------|----------|----------|----------|----------|-------------------|
File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
----------|----------|----------|----------|----------|-------------------|
All files |        0 |        0 |        0 |        0 |                   |
----------|----------|----------|----------|----------|-------------------|

Test Suites: 2 passed, 2 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        6.146s
```

## References
    https://jestjs.io/docs/en/snapshot-testing - Testing components using snapshots in React with Jest

    Coding standards and guidelines </br> 
    https://www.geeksforgeeks.org/coding-standards-and-guidelines/

    CKAN CSS Standards </br>
    https://docs.ckan.org/en/ckan-2.7.3/contributing/css.html

    CKAN JavaScript Standards</br>
    https://docs.ckan.org/en/ckan-2.7.3/contributing/javascript.html

    ES6+ Programming Reference </br>
    http://es6-features.org/#Constants

    React Code Standards Guide </br>
    https://css-tricks.com/react-code-style-guide/

    JavaScript Spread Syntax</br>
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax

    JavaScript Array Filter</br>
    https://www.geeksforgeeks.org/javascript-array-filter/

    Git Commands / Tutorial</br>
    https://www.atlassian.com/git/tutorials/undoing-changes

    Git Commit Messages Guide</br>
    https://medium.com/@steveamaza/how-to-write-a-proper-git-commit-message-e028865e5791
