/*
* This spike was run with Quokka VScode extension which allows for real time logging when creating spikes
*/
//--------------------------------------------------------------------------
//spike test for Es6+ arrow functions
//old way to do it prior to es6
function sum(numOne, numTwo) {
    return numOne + numTwo;

}
console.log(sum(2,5));

//using arrow functions from es6
var sum2 = (numThree, numFour) => {return numThree + numFour};
console.log(sum2(5,6));
