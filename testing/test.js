/*
[Tests]

: run test by testcase name
: run test by subroutine
: run all testcases
: run optimize tests
  that only run testcase on functions that have been changed

: addTestCase(@TestCase)
  'defualt subroutine'
: addTestCaseForSubroutine(@TestCase)

--succuess--
- succuess message
- print the test case name
- current input

--OnError--
- Print the test case name
- function pointer
- line number
[current input : expected result]
*/
/*
[TestCase]
: name
: fucntion pointer
: inputs
: expected results
 */
 const RecordService = require('../Server/RecordService.js');
 let records_service = new RecordService(false);

 class Tests {
   constructor(){
     this.subroutines = new Map();
     this.subroutines.set("default",[]);
   }

   addTestCase(subroutine = 'defualt', testCase = {}){
     if(!testCase || testCase === {})
        return;
     if(this.subroutines.has(subroutine)){
       let testCases = this.subroutines.get(subroutine);
       testCases.push(testCase);

       this.subroutines.set(subroutine,testCases);
     }else{
        let testCases = [testCase];
        this.subroutines.set(subroutine,testCases);
     }
   }

   runTestCase(subroutine = 'default'){
     if(!this.subroutines.has(subroutine)){
       console.log("Skipping...failed to start tests for missing subroutine");
       return;
     }

     console.log(".".repeat(2)+"starting executing tests from subroutine "+subroutine+" ")
     let testCases = this.subroutines.get(subroutine);

     for(let i = 0; i<testCases.length; i++){
       testCases[i].runTest();
     }
   }

   runTestsForAllSubroutines(){
     let keys = this.subroutines[Symbol.iterator]();
     for(let subroutine of keys){
       this.runTestCase(subroutine[0]);
     }
   }
 }

 class TestCase {
   constructor(classPointer,functionPointer,inputs,expectedResult) {
     this.classPointer = classPointer;
     this.functionPointer = functionPointer;
     this.inputs = inputs;
     this.expectedResult = expectedResult;
   }
   runTest(){
     //Loop through all the input cases.
     for(let i = 0; i<this.inputs.length; i++){
       let output;
       let result;

       //Call the function that is going to be tested with its passed input.
       try{
         output = this.classPointer[this.functionPointer](this.inputs[i]);
       }catch(error){
         //set error and print then exit this input test
         result = {status:false,error:error}
         this.printTestResult(result,this.inputs[i]);
         continue;
       }

       /*determines what type is passed and determines how
       to calcuate if the output result is correct*/
       if(typeof this.expectedResult === 'function'){
          result = {status:this.expectedResult(this.inputs[i],output),output:output}

       /*if expectedResult is of type object
         each mapped value will be compared to the same mapped output
         if all keys have the same value then the test is correct.*/
       }else if(typeof this.expectedResult[i] === 'object'){
          let keys = Object.keys(this.expectedResult[i]);
          result = {status:true,output:output};
          for(let key in keys){
            if(this.expectedResult[i][keys[key]] !== output[keys[key]]){
              result.status = false;
            }
          }

       //If expectedResult is of type array
       }else{
          result = {status:output === this.expectedResult[i],output:output};
       }

       //print the result of the test case [correct,wrong,error]
       this.printTestResult(result,this.inputs[i]);
     }
   }

   printTestResult(result,input){
     if(result.error){
       console.log(".".repeat(10)+"⛔️ " + this.functionPointer + " Caused an error with input ["+input+"]")
       return;
     }
     if(result.status){
       console.log(".".repeat(10)+"✅ " + this.functionPointer + " passed with input ["+input+ "] and output "+result.output);
     }else{
       console.log(".".repeat(10)+"❌" + this.functionPointer + " Failed with input ["+input+ "] and output "+result.output);
     }
   }
 }


 /*
  Example on how to run testcase with all there types
 */
 class Example {
   testFunction1(arr){
     if(arr.length > 5){
       return true;
     }
     return false;
   }

   testFunction2(str){
     for(let i = 0;i<str.length; i++){
       if(str[i] === '%'){

       }
     }
     return str;
   }

   testFunction3(input){
     return input;
   }
 }

let example = new Example();
let test1 = new TestCase(example,"testFunction1",[[1,2,3,4,5,6],[1,3,5,6]],[true,false]);
let test2 = new TestCase(example,"testFunction2",["hello%joe","what%%test"],(input,output) => {return true});
let test3 = new TestCase(example,"testFunction3",[{name:"hi",number:5}],[{name:"hi",number:5}]);

let test = new Tests();
test.addTestCase('default',test3);
test.runTestsForAllSubroutines();
