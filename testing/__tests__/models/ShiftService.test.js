const dbhandler = require('../../../Server/wrappers/MysqlWrapper');
const ShiftService = require('../../../Server/services/ShiftService');
const Shift = require('../../../Server/models/Shift');

afterAll(()=>{
    dbhandler.db.destroy();
});

let data = {
    coveredBy:null,
    postedBy:25,
    postedDate:'2020-01-01 18:06:47',
    availability:0,
    positionID:1,
    groupID:0,
    perm:0,
    message:'',
}

const insertTestExpiredShift = async() => {
    let today = new Date().getDate();

    let start = new Date();
    start.setDate(today - 2);

    let end = new Date();
    end.setDate(today - 1);
    
    let shiftData = {...data,
        shiftDateEnd:end,
        shiftDateStart:start,
    }
    await new Shift().create(shiftData);
}

const insertTestValidShift = () => {
    let today = new Date();
    let end = new Date();
    end.setDate(today + 1);

    let shiftData = {...data,
        shiftDateEnd:end,
        shiftDateStart:today,
    }

    new Shift().create(shiftData);
}

flush = async(table) => {
    await dbhandler.query('delete from '+table+' where id >= 0');
}

let service = new ShiftService();

describe('Shift Migration', () => {
    it('Should delete an expired shift', async() => {
        
        //flush('legacyshifts');
        //flush('shifts');

        insertTestExpiredShift();
        
      

        console.log(service.openShifts);
        
    });
});
