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

const insertTestValidShift = async() => {
    let today = new Date();
    let end = new Date();
    end.setDate(today.getDate() + 1);

    let shiftData = {...data,
        shiftDateEnd:end,
        shiftDateStart:today,
    }

    await new Shift().create(shiftData);
}

flushShifts = async(table) => {
    await dbhandler.query('delete from '+table+' where shiftID >= 0');
}

describe('Shift Deletion', () => {
    it('Should un-track,delete and migrate an expired shift', async() => {
        
        flushShifts('legacyshifts');
        flushShifts('shifts');

        await insertTestExpiredShift();

        let service = new ShiftService();
        
        //capture expired shift
        await service.gatherOpenShifts();

        expect(service.openShifts.length).toBe(1);

        //find expired shift then delete and migrate
        let deletionSyncWrapper = async() => {service.search();}

        await deletionSyncWrapper();

        //Expect the shift to be no longer being tracked
        expect(service.openShifts.length).toBe(0);

        let resolves = await Promise.all([
            dbhandler.query('select * from shifts'),
            dbhandler.query('select * from legacyshifts'),
        ]);

        resolves = resolves.map((obj) => obj.length);
        
        expect(resolves).toEqual([0,1]);
    });

    it.only('Should NOT un-track,delete and migrate a valid non-expired shift', async() => {
        
        flushShifts('legacyshifts');
        flushShifts('shifts');

        await insertTestValidShift();

        let service = new ShiftService();

        //capture valid shift
        await service.gatherOpenShifts();

        expect(service.openShifts.length).toBe(1);

        //find expired shift then delete and migrate
        let deletionSyncWrapper = async() => {service.search();}

        await deletionSyncWrapper();

        await service.gatherOpenShifts();

        expect(service.openShifts.length).toBe(1);

        let resolves = await Promise.all([
            dbhandler.query('select * from shifts'),
            dbhandler.query('select * from legacyshifts'),
        ]);

        resolves = resolves.map((obj) => obj.length);
        
        expect(resolves).toEqual([1,0]);
    });
});
