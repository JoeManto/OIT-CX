const mysql = require('mysql');
const config = require('./SecertConfig.js');

//DataBase Connection Config
const db = mysql.createConnection(config.db_config());

//Test DataBase Connection
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('mysql connected...');
});

/*
  Manages all the active shifts in the database.
*/
class ShiftService {
    constructor(){
        this.openShifts = [];
        this.gatherOpenShifts();
    }

    /*
      Config function to first gather all the open shifts in the database
    */
    gatherOpenShifts(){
        db.query("select * from shifts",(err,values) => {
            if(err){
                console.log(err);
                return;
            }
            for(let i = 0;i<values.length;i++){
                this.addShiftTracking(values[i]);
            }
        });
    }

    /*
      Refreshing the open shifts
      This accounts for shift getting manually delete.
    */
    pruneOpenShifts(){
        this.openShifts = [];
        this.gatherOpenShifts();
    }

    /*
      Adds shift into the open shifts array.
      The all the shift details are pushed as an object into the open shift
      arrays.
    */
    addShiftTracking(shift){
        let dupShiftStatus = false;
        for(let i = 0;i<this.openShifts.length;i++){
            if(this.openShifts[i].shiftID === shift.shiftID){
                dupShiftStatus = true;
            }
        }

        if(!dupShiftStatus){
            shift.shiftDateEnd = Number(shift.shiftDateEnd);
            shift.shiftDateStart = Number(shift.shiftDateStart);
            this.openShifts.push(shift);
        }
        return dupShiftStatus;
    }

    /*
      Removes a collection [1..any] of selected shifts from the open shifts array.
    */
    removeShifts(shifts){
        let sql = "";
        for(let i = 0;i<shifts.length;i++){
            if(i === 0)
                sql += "DELETE FROM shifts WHERE ";
            if(i !== shifts.length-1){
                sql += "shiftID = "+shifts[i].shiftID+" OR ";
            }else{
                sql += "shiftID = "+shifts[i].shiftID;
            }
        }
        if(sql !== ""){
            db.query(sql,(err,_) =>{
                if(err){
                    console.log("[SHIFT WORKER] error deleting shifts");
                }
                this.migrateShiftData(shifts)
                .then(res => console.log("[SHIFT WORKER] : "+res.res))
                .catch(err => console.log("[SHIFT WORKER] : "+err.error));
                this.pruneOpenShifts()
            });
        }

    }
    
    /*
      MigrateData shift records that are going to be remove and achive them to the legacy shift records table
    */
    migrateShiftData(shifts){
      return new Promise(function (resolve,reject){
        let sql = "";
        for(let i = 0;i<shifts.length;i++){
          let curShift = shifts[i];
          if(i === 0){
            sql += "Insert into legacyShifts (shiftID,coveredBy,postedBy,postedDate," +
              "availability,positionID,groupID,perm,message,shiftDateEnd,shiftDateStart) values ";
          }
          //Javascript/mysql fuckery because dates get returned has date object instead of strings...
          let date = new Date(shifts[i].postedDate.getTime() - (shifts[i].postedDate.getTimezoneOffset() * 60000)).toISOString();
          date = date.slice(0, 19).replace('T', ' ');

          sql += "("+curShift.shiftID+","+curShift.coveredBy+","+curShift.postedBy+",'"
              +date+"',"+curShift.availability+","+curShift.positionID
              +","+curShift.groupID+","+curShift.perm+",'"+curShift.message+"',"+curShift.shiftDateEnd
              +","+curShift.shiftDateStart+")";

          if(i!==shifts.length-1){
            sql+=","
          }
        }
        db.query(sql,(err,result) => {
          if(err){
            reject({error:"Error While Migrating Shift Data"});
          }else{
            resolve({res:"Migration Success"});
          }
        });
      });
    }

    /*
      Searches all the open shifts and compares the endTime of the shift to the
      current date and adds the shift to be removed if the condition is true.
    */
    search(){
        let shiftsToRemove = [];
        let now = new Date().getTime();

        for(let i = 0;i<this.openShifts.length;i++){
            console.log("[SHIFT WORKER] : checking shift with ID = "+this.openShifts[i].shiftID);

            //If a perm shift has been picked up. Remove posting.
            if(this.openShifts[i].availability === 1 && this.openShifts[i].perm === 1){
                console.log("adding shift to delete");
                shiftsToRemove.push(this.openShifts[i]);
                this.openShifts[i] = null;
            }else if(this.openShifts[i].shiftDateEnd <= now && this.openShifts[i].perm === 0){
                console.log("adding shift to delete");
                shiftsToRemove.push(this.openShifts[i]);
                this.openShifts[i] = null;
            }
        }
        if(shiftsToRemove.length>0){
          console.log("calling remove shifts");
          this.openShifts.filter(shift => shift !== null);
          this.removeShifts(shiftsToRemove);
        }
        this.pruneOpenShifts();
    }
}

let service = new ShiftService();

//listen for interval messages from the parent
//This process message check handles calling all the functions in 'ShiftService'
process.on("message",function (m) {
    let split = m.split(' ');
    if(split[0] === 'ADD'){
        
        //Gather all shift details for a shiftID and add the shift to the open shifts pool
        db.query(mysql.format("select * from shifts where shiftID = ?"),[Number(split[1])],(err,result) =>{
           if(err){console.log(err);return;}
           service.addShiftTracking(result[0]);
        });
        process.send("Shift Add Opt Complete");
    }else if(split[0] === "CHECK") {
        service.search();
        process.send("Checked open shifts");
    }else if(split[0] === "PRUNE"){
        service.pruneOpenShifts();
        process.send("Shifts Pruned");
    }else{
        process.send('UNKNOWN OPT');
    }
});
