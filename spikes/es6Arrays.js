/*
* This spike was run with Quokka VScode extension which allows for real time logging when creating spikes
*/
//The following spike will test the new find method for arrays in JavaScript
var numbers = [2,56, 15,23,4, 123];
var first = numbers.find(greaterThan15); //find will get the first element of an array that passes some functional test

//use this as our test function
let greaterThan15 = (value, index, array) => {
  return value > 15;
}

//Or

numbers.find(x => x > 15);

console.log(first); //only 56 is returned here since it is the first thing to pass the functions test, even though there are others > 15 that are less

//We can also find the index of that element using Arrays.findIndex
var index = numbers.findIndex(greaterThan15);
console.log(index); //logs 1 as the index of 56