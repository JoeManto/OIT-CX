const dbhandler = require('../../../Server/wrappers/MysqlWrapper');
const RecordService = require('../../../Server/services/RecordService');

afterAll(()=>{
    dbhandler.db.destroy();
})


describe('Data Migration', () => {

    let recordService = new RecordService();

    it ('Should insert records with out crashing', async() => {

        let data =  await dbhandler.query("insert into records (cosID,empyID,location,date) values (23,3,0,'2019-12-19 12:49:13')")
        .then(() => true)
        .catch(() => false);

        expect(data).toBeTruthy();

    });


    it ('Should migrate records into legacyRecords', () => {

        let res = recordService.migrateData()
        .then(() => true)
        .catch(err => {
            console.log(err);
            return false;
        })

        expect(res).toBeTruthy();

    });



    it ('Should not run when there are no records',async() => {

        //clean
        await dbhandler.query("delete from records where cosID >= 0");

        recordService = new RecordService();

        let didMigration = await recordService.checkForDataMigration();

        expect(didMigration).toBeFalsy();

    });

});

describe('checkForDataMirgation', () => {
    it ('Should run at the start of a new day', async() => {

        //insert some random data in the records to avoid an error
        await dbhandler.query("insert into records (cosID,empyID,location,date) values (23,3,0,'2019-12-19 12:49:13')")

        recordService = new RecordService(true); //true to force the change of the date

        let didMigration = recordService.checkForDataMigration();

        expect(didMigration).toBeTruthy();

    })
});
