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


 class TestCase {
   constructor(classPointer,functionPointer,expectedResult) {
     this.classPointer = classPointer;
     this.functionPointer = functionPointer;
     this.expectedResult = expectedResult;
   }
   runTest(){
     let output = this.classPointer[this.functionPointer]();
     let result = {status:false};

     if(typeof this.expectedResult === 'function'){
       try{
          result = {status:this.expectedResult()};
       }catch(error){
          result = {status:false,error:error}
       }
     }else{
       let result = {status:output === this.expectedResult};
     }

     if()
   }



 }

let result = new TestCase(records_service,"checkForDataMigration",()=>{return true});
result.runTest();
