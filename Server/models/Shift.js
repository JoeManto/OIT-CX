const db = require('../wrappers/MysqlWrapper');
const Employee = require('../models/Employee');
const User = require('../models/User');

/*
 Shift Abstraction
 -  Find Shifts from id
 -
*/

class Shift {
    constructor(){
       
    }

    /*
        Retrieves a shift in the database by shiftID
        and sets that shift as the current shift.
    */
    async apply(shiftID){

        let result = await db.query("select * from shifts where shiftID = ?",{conditions:[shiftID]});

        if(result.length === 0)
           return Promise.reject(new Error("❌ No shift with the id "+shiftID+" was found"));

        this.shiftID = shiftID;

        this.build(result[0]);

        return result[0];
    }

    /** 
        builds a structured shift object that holds more information
        and assigns that object to the class.
        
        @return {Object} structuredShiftObject 
        @param {Object} shiftData the raw sql return object
    */
    build(sqlResult){

        this.rawData = sqlResult;

        this.shiftData = {...sqlResult,
            shiftDateEnd:new Date(Number(sqlResult.shiftDateEnd)),
            shiftDateStart:new Date(Number(sqlResult.shiftDateStart)),
        };

        /* Gathers Posted and Covered Users Data. Data is pending Promise*/
        if(sqlResult.postedBy !== null){
            let postedBy = new User(undefined,'employee').lookup({by:'id',value:sqlResult.postedBy})
            this.shiftData.postedBy = postedBy;
        }
        
        if(sqlResult.coveredBy !== null){
            let coveredBy = new User(undefined,'employee').lookup({by:'id',value:sqlResult.coveredBy})
            this.shiftData.coveredBy = coveredBy;
        }
    }

    /**
     * 
     * @param {*} param0 
     */

     /**
        shiftID: INT,
        coveredBy: INT ID NULLABLE,
        postedBy: INT ID,
        postedDate: DATE,
        availability: INT,
        positionID: INT,
        groupID: INT,
        perm: INT,
        message: {String},
        shiftDateEnd: DATE,
        shiftDateStart: DATE,
     */
    async create({coveredBy,postedBy,postedDate,availability,positionID,groupID,perm,message,shiftDateEnd,shiftDateStart}){
        
        let end = shiftDateEnd.getTime();
        let start = shiftDateStart.getTime();

        await db.query('insert into shifts (coveredBy,postedBy,postedDate,availability,positionID,groupID,perm,message,shiftDateEnd,shiftDateStart) values (?,?,?,?,?,?,?,?,?,?)',{conditions:[
            coveredBy,postedBy,postedDate,availability,positionID,groupID,perm,message,end,start,
        ]})
        .catch(err => console.log("Error inserting new shift \n" + err));

        let dbResult = await db.query('select max(shiftID) from shifts');

        let id = dbResult['0']['max(shiftID)'];

        await this.apply(id);

        return id;
    }

}

module.exports = Shift;

