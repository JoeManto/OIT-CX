const dbhandler = require('../../../Server/wrappers/MysqlWrapper');
const Shift = require('../../../Server/models/Shift');

afterAll(()=>{
    dbhandler.db.destroy();
});

const testShiftData = () =>{
    let now = new Date();
    let endDate = now;
    endDate.setDate(now.getDate()+1);

    return {
        coveredBy:null,
        postedBy:25,
        postedDate:'2020-01-01 18:06:47',
        availability:0,
        positionID:1,
        groupID:0,
        perm:0,
        message:'',
        shiftDateEnd:endDate,
        shiftDateStart:now,
    }
}

describe('Shift Delete Function', () => {
    it('Should delete the current shift', async() => {

        let shift = new Shift();

        await shift.create(testShiftData());

        let shiftId = shift.shiftData.shiftID;

        shift.delete();

        let resolves = await Promise.all([
            dbhandler.query('select * from shifts where shiftID = ?',{conditions:[shiftId]}),
            dbhandler.query('select * from legacyshifts where shiftID = ?',{conditions:[shiftId]}),
        ]);
        
        resolves = resolves.map(obj => obj.length);

        expect(resolves).toEqual([0,0]);
        expect(shift.rawData).toBe(undefined);
        expect(shift.shiftData).toBe(undefined);
    });

    it('Should migrate the deleted shift', async() => {
        let shift = new Shift();

        await shift.create(testShiftData());

        let shiftId = shift.shiftData.shiftID;

        shift.delete({migrate:true});

        let resolves = await Promise.all([
            dbhandler.query('select * from shifts where shiftID = ?',{conditions:[shiftId]}),
            dbhandler.query('select * from legacyshifts where shiftID = ?',{conditions:[shiftId]}),
        ]);

        resolves = resolves.map(obj => obj.length);

        expect(resolves).toEqual([0,1]);
    });
});

describe('Shift Apply Function', () => {
    it('Should retrieve a shift from DB by shiftID and set it as current shift', async() =>{
        let shift = new Shift();

        let dbResult = await dbhandler.query('select max(shiftID) from shifts');

        let id = dbResult['0']['max(shiftID)'];

        if(id === null){
            console.log('No shifts are in the database');
            expect(1).toBe(0);
            return;
        }

        await shift.apply(id);
        expect(shift.rawData).not.toBe(undefined);
        expect(shift.shiftData).not.toBe(undefined);
    });
});

