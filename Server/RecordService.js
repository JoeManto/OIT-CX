const mysql = require('mysql');
const config = require('./SecertConfig.js');

//DataBase Connection Config

//let config1 = config.db_config();
//console.log(config1);
const db = mysql.createConnection(config.db_config());

//Create DataBase Connection
db.connect((err) => {
  if (err) {
      throw err;
  }
  console.log('mysql connected...');
});

/**
  Manages all the active records in the data base.
*/
class RecordService {
  constructor(){
    Object.assign(this, {startDate:new Date()});
  }

  /*
  Checks the server start date and the current date.
  This check determines if the records table needs to be emptied because of
  the start of a new day.
  */
 checkForDataMigration(){
    let now = new Date();

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
    return new Promise(function (resolve, reject) {
      db.query("Select * from records",(err,result) =>{
        if(err){
          reject("mysql not connected");
          return;
        }
        if(result.length === 0)
          return reject("No Records Found");

        let migrateQuery = "Insert into legacyRecords (cosID,empyID,location,date) values ";
        for(let i = 0;i<result.length;i++){

          //Javascript/mysql fuckery because dates get returned has date object instead of strings...
          let date = new Date(result[i].date.getTime() - (result[i].date.getTimezoneOffset() * 60000)).toISOString();
          date = date.slice(0, 19).replace('T', ' ');

          migrateQuery+="("+result[i].cosID+","+result[i].empyID+","+result[i].location+",'"+date+"')";
          if(i!==result.length-1){
            migrateQuery+=","
          }
        }

        //Performs the migration of the record data
        db.query(migrateQuery,(err,result) => {
          if(err)
            return reject("err during data migration");
        });

        //Flushes the data out of the records table
        db.query("Delete from records where cosID > -1",(err,result) =>{
          if(err)
            return reject("err during flushing records");

          resolve(true);
        });
      });
    });
  }
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
