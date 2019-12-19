const db = require('../wrappers/MysqlWrapper');
const Util = require('../../Util/Util');
const config = require('../SecertConfig.js');
var MockDate = require('mockdate');

/**
  Manages all the active records in the data base.
*/
class RecordService {
  constructor(forceNextDay){
    
    Object.assign(this, {startDate:new Date(),didMigrationTest:false});
    this.shouldForceNextDay = forceNextDay;
    //this.db = this.buildDBConnection();

    /*console.log("time has changed");
    let timezoneOffset = new Date().getTimezoneOffset();
    let target = new Date();
    target.setHours(23);
    target.setMinutes(58);
    MockDate.set(target,timezoneOffset);*/
  }

  /*buildDBConnection(){
    //DataBase Connection Config
    const db = mysql.createConnection(config.db_config());
    db.connect((err) => {
      if (err) {
          throw err;
      }
      //console.log('mysql connected...');
    });

    return db;
  }*/

  /*
  Checks the server start date and the current date.
  This check determines if the records table needs to be emptied because of
  the start of a new day.
  */
 checkForDataMigration(){
    let now = new Date();
    
    /*For Testing Midnight records migration*/
    if(this.shouldForceNextDay && !this.didMigrationTest){ 
      now.setDate(this.startDate.getDate()+1);
      this.didMigration = true;
      console.log("changed did Migration to "+ this.didMigration);
    }

    console.log("OLD Date = "+this.startDate.getDate() + " Now Date = " + now.getDate());
    console.log(now.toLocaleTimeString() + " " +now.toDateString());

    if(this.startDate.getDate() < now.getDate()){
      console.log("Starting Record Data Migration");
      //Run the migration and return the completion status

       this.migrateData()
      .then(res => {
        Object.assign(this,{startDate:new Date()});
      })
      .catch(error => {
        console.log("[AUTO][Record WORKER] :"+error);
        Object.assign(this,{startDate:new Date()});
      });
      return true;
    }else{
      return false;
    }
  }

  /*
    Inserts all the data from 'records' to 'legacyRecords'
    then removes all the entries in records.
    The completion status is sent via a promise.
  */
  migrateData(){
    return new Promise(async(resolve, reject) => {
      db.query('select * from records')
      .then(result => {
        if(result.length === 0)
          return reject("No Records Found"); 

        let migrateQuery = "Insert into legacyRecords (cosID,empyID,location,date) values ";
        for(let i = 0;i<result.length;i++){

          migrateQuery+="("+result[i].cosID+","+result[i].empyID+","+result[i].location+",'"+Util.dateToMysqlDateTime(new Date(result[i].date))+"')";
          if(i!==result.length-1){
            migrateQuery+=","
          }
        }
        return db.query(migrateQuery);
      })
      .then(res => {
          return db.query('Delete from records where cosID > -1');
      })
      .then(_ => resolve(true))
      .catch(_ => reject("err during data migration"))
      .catch(_ => reject("err flushing data"))
      .catch(err =>{
        return reject(err);
      });
    });
  }
  
  /*migrateData(){
    return new Promise(function (resolve, reject) {
      this.db.query("Select * from records",(err,result) =>{
        if(err){
          reject("mysql not connected");
          return;
        }
        if(result.length === 0)
          return reject("No Records Found");

        let migrateQuery = "Insert into legacyRecords (cosID,empyID,location,date) values ";
        for(let i = 0;i<result.length;i++){

          migrateQuery+="("+result[i].cosID+","+result[i].empyID+","+result[i].location+",'"+Util.dateToMysqlDateTime(new Date(result[i].date))+"')";
          if(i!==result.length-1){
            migrateQuery+=","
          }
        }

        //Performs the migration of the record data
        this.db.query(migrateQuery,(err,result) => {
          if(err){
            error = 'err during data migration'
            return reject("err during data migration");
          } 
        });
      
        //Flushes the data out of the records table
        this.db.query("Delete from records where cosID > -1",(err,result) =>{
          if(err)
            return reject("err during flushing records");

          resolve(true);
        });
      });
    });
  }*/
}

module.exports = RecordService;
let recordsService = new RecordService();

//listen for interval messages from the parent
//This process message check handles calling all the functions in 'RecordService'
process.on("message",function (m) {
    if(m === "CHECK") {
        let statusString = recordsService.checkForDataMigration() ? "[Completed]":"[Not Ready]";
        process.send("Checked date for data migration "+statusString);
    }else{
        process.send('UNKNOWN OPT');
    }
});
