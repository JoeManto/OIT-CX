const dbhandler = require('../../../Server/wrappers/MysqlWrapper');
const Shift = require('../../../Server/models/Shift');

afterAll(()=>{
    dbhandler.db.destroy();
});

describe('Shift Create Function', () => {
    test('Should create a shift',async() =>{

        let now = new Date();

        let endDate = now;
        endDate.setDate(now.getDate()+1);

        let shift = new Shift();
        let id = await shift.create({
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
        });

        result = await dbhandler.query('select * from shifts where shiftID = ?',{conditions:[id]});

        expect(result.length === 1).toBeTruthy();
    })
});


