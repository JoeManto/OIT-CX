//This spike will be the first test of using the Jest testing framework
const functions = {
    add: (num1, num2) => num1 + num2
};

test('Adds 2 + 2 to get 4', () => {
    expect(functions.add(2,2)).toBe(4);
});