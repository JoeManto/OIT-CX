/*
* This spike was run with Quokka VScode extension which allows for real time logging when creating spikes
*/
//spread syntax
//using replace apply to use elements of an array as arguments to a function
//OLD WAY
function myFunction(x, y, z) { }
var args = [0, 1, 2];
myFunction.apply(null, args);

//NEW WAY
function myFunction(x, y, z) { }
var args = [0, 1, 2];
myFunction(...args); //SPREAD SYNTAX 
