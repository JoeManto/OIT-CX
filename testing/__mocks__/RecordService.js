const db = require('../../Server/wrappers/MysqlWrapper');
const Util = require('../../Util/Util');
const config = require('../../Server/SecertConfig');

/**
  Manages all the active records in the data base.
*/
class RecordService {
  constructor(forceNextDay){
    
    Object.assign(this, {startDate:new Date(),didMigrationTest:false});
    this.shouldForceNextDay = forceNextDay;
  }

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
    }

    if(this.startDate.getDate() < now.getDate()){
      console.log("Starting Record Data Migration");
      //Run the migration and return the completion status

       this.migrateData()
      .then(_ => {
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
      .then(_ => {
          return db.query('Delete from records where cosID > -1');
      })
      .then(_ => resolve(true))
      .catch(_ => {reject("err during data migration");console.log(_);})
      .catch(_ => reject("err flushing data"))
      .catch(err =>{
        return reject(err);
      });
    });
  }
}

module.exports = RecordService;
