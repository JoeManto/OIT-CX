const db = require('../wrappers/MysqlWrapper');
const Employee = require('../models/Employee');
const User = require('../models/User');

/*
 Shift Abstraction
 -  Find Shifts from id
 -
*/

class Shift {
    constructor(shiftID){
        this.shiftID = shiftID;
        this.shiftData = {

        }
    }

    /*

    */
    async apply(shiftID){
       let result = await db.query("select * from shifts where shiftID = ?",{conditions:[shiftID]});

       if(result.length === 0)
           return Promise.reject(new Error("❌ No shift with the id "+shiftID+" was found"));

       this.shiftData = this.build(result[0]);

       return result[0];
    }

    /*

    */
    build(shiftData){

        this.shiftData = {...shiftData,
            shiftDateEnd:new Date(Number(shiftData.shiftDateEnd)),
            shiftDateStart:new Date(Number(shiftData.shiftDateStart)),
        };

        let postedBy = new User(undefined,'employee').lookup({by:'id',value:shiftData.postedBy});

        this.shiftData.postedBy = postedBy;

        console.log(this.shiftData.postedBy);
        console.log(typeof this.shiftData.coveredBy);
    }
}

let shift = new Shift(59);
shift.apply(59)
    .then(res => console.log(res));

