const mysql = require('mysql');
const config = require('./SecretConfig');

//DataBase Connection Config
const db = mysql.createConnection(config.db_config());

//Test DataBase Connection
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('mysql connected...');
});


class RecordService {
  constructor(){
    this.startDate = new Date();
  }

  /*
  Checks the server start date and the current date.
  This check determines if the records table needs to be emptied because of
  the start of a new day.
  */
  checkForDataMigration(){
    let now = new Date();
    if(this.startDate.getDate()<now.getDate()){
      //Run the migration and return the error status
      return migrateData()
      .then(res => {this.stateDate = now;return res;})
      .catch(error => {return error});
    }
    return false;
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
          console.log("mysql not connected");
          reject(false);
        }
        if(result.length === 0)
          reject(false);
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
          if(err){
            console.log("err during data migration");
            reject(false);
          }
        });

        //Flushes the data out of the records table
        db.query("Delete from records where cosID > -1",(err,result) =>{
          if(err){
            console.log("err during flushing records");
            reject(false);
          }
        });
      });
      reslove(true);
    });
  }
}

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
