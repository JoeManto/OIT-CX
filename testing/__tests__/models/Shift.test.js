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


/*describe('Shift Create Function', () => {
    test('Should create a shift',async() =>{

        let shift = new Shift();
        let id = await shift.create(testShiftData());

        result = await dbhandler.query('select * from shifts where shiftID = ?',{conditions:[id]});

        expect(result.length === 1).toBeTruthy();
    });
});*/


describe('Shift Apply Function', () => {
    test.only('Should retrieve a shift from DB by shiftID and set it as current shift', async() =>{
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
    });

});

