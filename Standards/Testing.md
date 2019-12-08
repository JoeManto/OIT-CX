# Testing Standards for OIT-CX

## Unit Testing

Unit Tests need to be conducted for every finish React component and every function should ideally should have a Jest test associated to it.



#### Unit Testing with Jest
-   All tests need to be in the directory named `__tests__`
    This folder name will allow jest to automatically find unit tests.
    Alternately, tests can have the file extension prefix `.test.js` which will also allow jest to spot tests. 
-   Example Jest test file name would be the following `spiketest1.test.js`

- The testing file should have the same file name prefix as the file that is being tested
- The testing file should not contain tests that are from unrelated files

#### Example Test with Jest
```javascript
const functions = {
    add: (num1, num2) => num1 + num2
}

test('Adds 2 + 2 to get 4', () => {
    expect(functions.add(2,2)).toBe(4);
})
```

#### Running Jest Unit Tests
The Jest unit tests can be ran using the command `jest`. jest then takes a path to where you tests are found `jest path/to/tests`. 

    jest spikes

To run the unit tests for the frontend you run 

    npm test

this will run all the tests in the `src` directory, which holds all the react components.  

## System Testing
- System testing is automated through Jest by using a global call of jest. This can be done with the following command: 

    `jest` (in the root directory)

- This will search through the entire directory of the project and find any file with the extension `.test.js`.
- The output will show the number of tests that were found and ran along with the number of them that passed.
- Snapshots can also be created for components using Jest (more on this later). All snapshots will also be ran using the `jest` command. 



## Coverage Testing
- We will use jest to automatically generate coverage reports using the following command:</br>
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