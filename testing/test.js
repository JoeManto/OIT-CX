 const dotenv = require('dotenv');
 const mysql = require("mysql");
 const config = require('../Server/SecertConfig.js');
 const sleep = require('../Util/Util.js').sleep;
 const RecordService = require('../Server/RecordService.js');
 const ApiKeyService = require('../Server/ApiKeyService.js');
 const db = mysql.createConnection(config.db_config());

 let api_service = new ApiKeyService({
   startAutomaticCheck:false,
 });
 let records_service = new RecordService();

 class Tests {
   constructor(){
     this.subroutines = new Map();
     this.subroutines.set("default",[]);
     this.mysqlReady = false;

     db.connect((err) => {
       if (err) {
           throw err;
       }
       this.mysqlReady = true;
       console.log('mysql connected...');
     });
   }

   /**
   Adds a testcase object to a mapped subroutine
   */
   addTestCases(testCase,subroutine = 'default'){

     console.log(subroutine);
     if(process.env.DEV_STATE !== "1"){
       console.log("Unable to add test case: DEV_STATE is not set to the testing state");
       return;
     }
     //if the testcase is missing return
     if(!testCase || testCase === {})
        return;
     //subroutine was found
     if(this.subroutines.has(subroutine)){
       let testCases = this.subroutines.get(subroutine);
       if(typeof testCases === 'object'){
          for(let i = 0;i<testCase.length; i++){
            testCases.push(testCase[i]);
          }
       }else{
          testCases.push(testCase);
       }

       this.subroutines.set(subroutine,testCases);
     //subroutine was not found
     }else{
        let testCases;
        if(testCase === 'object')
          testCases = testCase;
        else
          testCases = [...testCase];
        this.subroutines.set(subroutine,testCases);
     }
   }

   async runTestCase(subroutine = 'default'){

     while(!this.mysqlReady){
       console.log("waiting for mysql to mount before running tests");
       await sleep(500);
     }
     if(!this.subroutines.has(subroutine) || this.subroutines.get(subroutine).length === 0){
       console.log("Skipping...failed to start tests for missing or empty subroutine "+subroutine);
       return;
     }
     console.log(".".repeat(2)+"starting executing tests from subroutine "+subroutine+" ")
     //Gather each testcase and run all tests in the subroutine
     let testCases = this.subroutines.get(subroutine);

     for(let i = 0; i<testCases.length; i++){
        testCases[i].runTest();
     }
   }

   //Gathers all subroutine keys in the map and runs all the testcases in each
   runTestsForAllSubroutines(){
     let keys = this.subroutines[Symbol.iterator]();
     for(let subroutine of keys){
       this.runTestCase(subroutine[0]);
     }
   }
 }

 class TestCase {
   constructor(classPointer,functionPointer,inputs,expectedResult,numParmsForInput) {
     this.classPointer = classPointer;
     this.functionPointer = functionPointer;
     this.inputs = inputs;
     this.expectedResult = expectedResult;
     this.numParmsForInput = numParmsForInput;
   }
   runTest(){
     //Loop through all the input cases.
     for(let i = 0; i<this.inputs.length; i++){
       let output;
       let result;

       //Call the function that is going to be tested with its passed input.
       try{
         switch(this.numParmsForInput){
           case 1:
            output = this.classPointer[this.functionPointer](this.inputs[i]);
            break;
           case 2:
            output = this.classPointer[this.functionPointer](this.inputs[i][0],this.inputs[i][1]);
            break;
           case 3:
            output = this.classPointer[this.functionPointer](this.inputs[i][0],this.inputs[i][1],this.inputs[i][2]);
            break;
           default:
            output = this.classPointer[this.functionPointer](this.inputs[i]);
         }
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

   getFormatInputOutputString(data){
      let output = [];
      if(typeof data === "object"){
        let keys = Object.keys(data);
        for(let i = 0; i<keys.length; i++){
          let line = [keys[i],data[keys[i]]]
          output = [...output,...line];
        }
        return output;
      }else{
        return data;
      }
   }

   printTestResult(result,input){
     if(result.error){
       console.log(".".repeat(10)+"⛔️ " + this.functionPointer + " Caused an error with input ["+input+"]")
       console.log(result.error);
       return;
     }
     if(result.status){
       console.log(".".repeat(10)+"✅ " + this.functionPointer + " passed with input ["+this.getFormatInputOutputString(input)+ "] and output ["+this.getFormatInputOutputString(result.output)+"]");
     }else{
       console.log(".".repeat(10)+"❌" + this.functionPointer + " Failed with input ["+this.getFormatInputOutputString(input)+ "] and output ["+this.getFormatInputOutputString(result.output)+"]");
     }
   }
 }

 module.exports = TestCase;


// * ------------------ Example of how to perfom a unit test --------------------
/*
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
*/
let test = new Tests();

let apiKeyServiceTestCases = [];

apiKeyServiceTestCases.push(new TestCase(api_service,'createKeyForUser',[["jfj5666",false,18000]],
(input,output) => {
  let result = false;
  for(let i = 0;i<api_service.openKeys.length;i++){
    if(api_service.openKeys[i].owner === input[0]){
      result = true;
    }
  }
  return result;
},3));

test.addTestCases(apiKeyServiceTestCases,'api');

test.runTestsForAllSubroutines();
