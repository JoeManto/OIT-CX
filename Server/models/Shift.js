const db = require('../wrappers/MysqlWrapper');
const Employee = require('../models/Employee');
const User = require('../models/User');

/*
    Interface for handling shift related database actions    

    rawData: The raw sql return record 
    shiftData: This is a structured and updated object.
    id: short for shiftData.shiftID
    
    !note rawData is not updated after changes
*/
class Shift {

    /*
        Retrieves a shift in the database by shiftID
        and sets that shift as the current shift.
    */
    async apply(shiftID){

        let result = await db.query("select * from shifts where shiftID = ?",{conditions:[shiftID]});

        if(result.length === 0)
           return Promise.reject(new Error("❌ No shift with the id "+shiftID+" was found"));

        this.shiftID = shiftID;

        await this.build(result[0]);

        return result[0];
    }

    /** 
        builds a structured shift object that holds more information
        and assigns that object to the class.
        
        @return {Object} structuredShiftObject 
        @param {Object} shiftData the raw sql return object
    */
    async build(sqlResult){

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

        let posName = await db.query('select posName from positions where id = ?',{conditions:[sqlResult.positionID]}); 
        this.shiftData.posName = posName[0].posName;

        this.id = this.shiftData.shiftID;
    }

    /**
     * Deletes the current shift present in the class instance
     * Pass in the option migrate to migrate the shift data.
     * 
     * Note: shiftData is set to undefined after
     * 
     * @param {Object} options | Migrate should shift be migrated into legacyshifts after deletion. 
     */
    delete(options){
        if(!this.shiftData) {
           return new Error('Deletion aborted no shift selected');
        }

        db.query('delete from shifts where shiftID = ?',{conditions:[this.shiftData.shiftID]})
        .catch(err => {
            console.log("[Shift] Error shift deletion for ID "+this.shiftData.shiftID);
            console.log(err);
            return;
        });

        if(options && options.migrate){

            let {shiftID,coveredBy,postedBy,postedDate,availability,positionID,groupID,perm,message,shiftDateEnd,shiftDateStart} = this.rawData;

            db.query('insert into legacyshifts (shiftID,coveredBy,postedBy,postedDate,availability,positionID,groupID,perm,message,shiftDateEnd,shiftDateStart) values (?,?,?,?,?,?,?,?,?,?,?)',
            {conditions:[
                shiftID,coveredBy,postedBy,postedDate,availability,positionID,groupID,perm,message,shiftDateEnd,shiftDateStart, 
            ]})
            .catch(err => {
                console.log("[Shift] Error shift migrating");
                console.log(err);
                return;
            });
        }

        this.shiftData = undefined;
        this.rawData = undefined;
    }

    /**
     * 
     * Creates a new shift that is inserted into the database
     * and sets the shift data in the class instance
     * 
     * @param {Int} shiftID 
     * @param {Int | null} coveredBy
     * @param {Int} postedBy
     * @param {Date} postedDate
     * @param {Int} availability
     * @param {Int} positionID 
     * @param {Int} groupID
     * @param {Int} perm
     * @param {String} message
     * @param {Date} shiftDateEnd
     * @param {Date} shiftDateStart
     */
    async create({coveredBy,postedBy,postedDate,availability,positionID,groupID,perm,message,shiftDateEnd,shiftDateStart}){
        
        let end = shiftDateEnd.getTime();
        let start = shiftDateStart.getTime();

        await db.query('insert into shifts (coveredBy,postedBy,postedDate,availability,positionID,groupID,perm,message,shiftDateEnd,shiftDateStart) values (?,?,?,?,?,?,?,?,?,?)',{conditions:[
            coveredBy,postedBy,postedDate,availability,positionID,groupID,perm,message,end,start,
        ]})
        .catch(err => {
            console.log("[Shift] Error inserting new shift");
            console.log(err);
            return;
        });

        let dbResult = await db.query('select max(shiftID) from shifts');

        let id = dbResult['0']['max(shiftID)'];

        await this.apply(id);

        return id;
    }

    /**
     * Updates the current shift and database to a user assignment of a shift 
     * 
     * @param {String} user The bnid of the user that is being assigned the current shift
     */
    async assignTo(user, options){
        if(!this.shiftData) return new Error("Can't assign shift: shift doesn't exist");

        //validate user exists and get ID
        let userObj = await db.query('select * from users where empybnid = ?',{conditions:[user]});

        if(userObj.length === 0){
            console.log('user '+user+' was not found');
            return;
        }

        //update
        db.query('Update shifts set coveredBy = ?, availability = ? where shiftId = ?',{conditions:[userObj[0].id,0,this.shiftData.shiftID]});
        this.shiftData.availability = 0;
        this.shiftData.coveredBy = userObj[0];

        if(!options) return;

        if(options.notify){

        }
    }
}

module.exports = Shift;

