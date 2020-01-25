const mysql = require('mysql');
const config = require('../SecertConfig.js');
const Util = require('../../Util/Util');
const db = require('../wrappers/MysqlWrapper');

/*
  Manages all the active shifts in the database.
*/
class ShiftService {
  constructor() {
    this.openShifts = [];
    this.gatherOpenShifts();
  }

  /*
    Config function to first gather all the open shifts in the database
  */
  async gatherOpenShifts() {

    const shifts = await db.query('select * from shifts')
      .catch(err => () => { throw new Error(err) });

    for (let i = 0; i < shifts.length; i++) {
      this.addShiftTracking(shifts[i]);
    }
  }

  /*
    Refreshing the open shifts
    This accounts for shift getting manually delete.
  */
  pruneOpenShifts() {
    this.openShifts = [];
    this.gatherOpenShifts();
  }

  /*
    Adds shift into the open shifts array.
    The all the shift details are pushed as an object into the open shift
    arrays.
  */
  addShiftTracking(shift) {
    let dupShiftStatus = false;
    for (let i = 0; i < this.openShifts.length; i++) {
      if (this.openShifts[i].shiftID === shift.shiftID) {
        dupShiftStatus = true;
      }
    }

    if (!dupShiftStatus) {
      shift.shiftDateEnd = Number(shift.shiftDateEnd);
      shift.shiftDateStart = Number(shift.shiftDateStart);
      this.openShifts.push(shift);
    }
    return dupShiftStatus;
  }

  /*
    Removes a collection [1..any] of selected shifts from the open shifts array.
  */
  removeShifts(shifts) {
    let sql = "";
    for (let i = 0; i < shifts.length; i++) {
      if (i === 0)
        sql += "DELETE FROM shifts WHERE ";
      if (i !== shifts.length - 1) {
        sql += "shiftID = " + shifts[i].shiftID + " OR ";
      } else {
        sql += "shiftID = " + shifts[i].shiftID;
      }
    }
    if (sql !== "") {

      db.query(sql)
        .catch(err => console.log("[SHIFT WORKER] error deleting shifts"));

      this.migrateShiftData(shifts)
        .then(res => console.log("[SHIFT WORKER] : " + res.res))
        .catch(err => console.log("[SHIFT WORKER] : " + err.error));

      this.pruneOpenShifts();
    }

  }

  /*
    MigrateData shift records that are going to be remove and archive them to the legacy shift records table
  */
  migrateShiftData(shifts) {
    return new Promise(function (resolve, reject) {
      let sql = "Insert into legacyShifts (shiftID,coveredBy,postedBy,postedDate," +
        "availability,positionID,groupID,perm,message,shiftDateEnd,shiftDateStart) values ";

      for (let i = 0; i < shifts.length; i++) {
        let curShift = shifts[i];

        sql += "(" + curShift.shiftID + "," + curShift.coveredBy + "," + curShift.postedBy + ",'"
          + curShift.postedDate.toISOString().slice(0, 19).replace('T', ' ') + "'," + curShift.availability + "," + curShift.positionID
          + "," + curShift.groupID + "," + curShift.perm + ",'" + curShift.message + "'," + curShift.shiftDateEnd
          + "," + curShift.shiftDateStart + ")";

        if (i !== shifts.length - 1) {
          sql += ","
        }
      }

      db.query(sql)
        .then(resolve({ res: "Migration Success" }))
        .catch(reject({ error: "Error While Migrating Shift Data" }));

    });
  }

  /*
    Searches all the open shifts and compares the endTime of the shift to the
    current date and adds the shift to be removed if the condition is true.
  */
  search() {
    let shiftsToRemove = [];
    let now = new Date().getTime();

    for (let i = 0; i < this.openShifts.length; i++) {
      console.log("[SHIFT WORKER] : checking shift with ID = " + this.openShifts[i].shiftID);

      //If a perm shift has been picked up. Remove posting.
      if (this.openShifts[i].availability === 1 && this.openShifts[i].perm === 1) {
        console.log("adding shift to delete");
        shiftsToRemove.push(this.openShifts[i]);
        this.openShifts[i] = null;
      } else if (this.openShifts[i].shiftDateEnd <= now && this.openShifts[i].perm === 0) {
        console.log("adding shift to delete");
        shiftsToRemove.push(this.openShifts[i]);
        this.openShifts[i] = null;
      }
    }
    if (shiftsToRemove.length > 0) {
      console.log("calling remove shifts");
      this.openShifts.filter(shift => shift !== null);
      this.removeShifts(shiftsToRemove);
    }
    this.pruneOpenShifts();
  }
}

module.exports = ShiftService;

let service = new ShiftService();

//listen for interval messages from the parent
//This process message check handles calling all the functions in 'ShiftService'
process.on("message", function (m) {
  let split = m.split(' ');
  if (split[0] === 'ADD') {

    //Gather all shift details for a shiftID and add the shift to the open shifts pool

    db.query('select * from shifts where shiftID = ?', { conditions: [Number(split[1])] })
      .then((res) => {
        service.addShiftTracking(res[0]);
      })
      .catch((err) => {
        console.log(err);
        return;
      });

    process.send("Shift Add Opt Complete");
  } else if (split[0] === "CHECK") {
    service.search();
    process.send("Checked open shifts");
  } else if (split[0] === "PRUNE") {
    service.pruneOpenShifts();
    process.send("Shifts Pruned");
  } else {
    process.send('UNKNOWN OPT');
  }
});
