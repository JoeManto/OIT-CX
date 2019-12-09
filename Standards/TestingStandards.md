# Testing Standards for OIT-CX
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