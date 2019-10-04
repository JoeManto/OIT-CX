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
 let records_service = new RecordService();

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
        str[i] = ' ';
      }
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
     for(let i = 0; i<this.inputs.length; i++){
       let output;
       let result;

       try{
         output = this.classPointer[this.functionPointer](this.inputs[i]);
       }catch(error){
         result = {status:false,error:error}
         this.printTestResult(result,this.inputs[i]);
         continue;
       }

       if(typeof this.expectedResult === 'function'){
          result = {status:output === this.expectedResult(this.inputs[i],output),output:output};

       }else{
          result = {status:output === this.expectedResult[i],output:output};
       }
       this.printTestResult(result,this.inputs[i]);
     }
   }

   printTestResult(result,input){
     if(result.error){
       console.log("..........⛔️ " + this.functionPointer + " Caused an error with input ["+input+"]")
       return;
     }
     if(result.status){
       console.log("..........✅ " + this.functionPointer + " passed with input ["+input+ "] and output "+result.output);
     }else{
       console.log("..........❌" + this.functionPointer + " Failed with input ["+input+ "] and output "+result.output);
     }
   }
 }

let example = new Example();
let test1 = new TestCase(example,"testFunction1",[[1,2,3,4,5,6],[1,3,5,6]],[true,false]);
let test2 = new TestCase(example,"testFunction2",["hello%joe","what%%test"],(input,output) => {return (input.replace('%',' ') === output)});
test2.runTest();
