const dbhandler = require('../../../Server/wrappers/MysqlWrapper');
const User = require('../../../Server/models/User');

afterAll(()=>{
    dbhandler.db.destroy();
});

describe('lookUp Function',() => {

    it('Should find employee records by id',async() => {

        let user = new User(undefined,'employee');
        //Assumes the database has user with an id of 3
        let data = await user.lookup({by:'id',value:'3'});

        expect(data).not.toBe(undefined);
    });

    it('Should find employee records by directly setting bnid',async() => {
        let user = new User('jfj5666','employee');

        let data = await user.lookup({});

        expect(data).not.toBe(undefined);
    });

    it('Should find customer records by id', () => {
        let customer = new User(undefined,'customer');

        //Assumes Data customer with id 686 exists
        let data = await user.lookup({by:'id',value:'686'});

        expect(data).not.toBe(undefined);
    });
});


