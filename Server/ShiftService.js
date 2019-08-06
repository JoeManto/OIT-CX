const mysql = require('mysql');

//DataBase Connection Config
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'nodemysql'
});

//Test DataBase Connection
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('mysql connected...');
});

class ShiftService {

    constructor(){
        this.openShifts = [];
        this.gatherOpenShifts();
    }

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

    pruneOpenShifts(){
        this.openShifts = [];
        this.gatherOpenShifts();
    }

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

      static removeShifts(shifts){
        let sql = "";
        for(let i = 0;i<shifts.length;i++){
            if(i === 0)
                sql += "DELETE FROM SHIFTS WHERE ";
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
            });
        }
    }

    search(){
        let shiftsToRemove = [];
        let now = new Date().getTime();
        for(let i = 0;i<this.openShifts.length;i++){
            console.log("[SHIFT WORKER] : validated shift with ID = "+this.openShifts[i].shiftID);
            if(this.openShifts[i].shiftDateEnd <= now){
                shiftsToRemove.push(this.openShifts[i]);
            }
        }
        if(shiftsToRemove.length>0) ShiftService.removeShifts(shiftsToRemove);
    }
}

let service = new ShiftService();

process.on("message",function (m) {
    let split = m.split(' ');
    if(split[0] === 'ADD'){
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


