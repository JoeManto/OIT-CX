const dbhandler = require('../../../Server/wrappers/MysqlWrapper');
const RecordService = require('../../__mocks__/RecordService');


afterEach(()=>{
    dbhandler.db.destroy();
})

describe('Data Migration', () => {
    
    let recordService = new RecordService();

    it ('Should insert records with out crashing', async() => {

        let data =  await dbhandler.query("insert into legacyRecords (cosID,empyID,location,date) values (23,3,0,'2019-12-19 12:49:13')")
        .then(res => {return true})
        .catch(res => {return false});

        expect(data).toBeTruthy();
    });


    it ('Should insert into legacyRecords', () => {
        dbhandler.build();

        return dbhandler.query("insert into legacyRecords (cosID,empyID,location,date) values (23,3,0,'2019-12-19 12:49:13')").then( _ => {
            let res = recordService.migrateData()
            .then(res => {
                console.log(res);
                return true;
            })
            .catch(err => {
                console.log(err);
                return false
            })
            expect(res).toBeTruthy(); 
        })
        .catch(err => {
            console.log(err);
        });
    });
});