const dbhandler = require('../../../Server/wrappers/MysqlWrapper');
const User = require('../../../Server/models/User');

afterAll(()=>{
    dbhandler.db.destroy();
});

describe('lookUp Function',() => {

    it('Should find employee records by id',async() => {

        let user = new User(undefined,'employee');
        //Assumes the database has user with an id of 3
        let data = await user.lookup({by:'id',value:'3'})
        .catch(err => console.log(err));

        expect(data).not.toBe(undefined);

    });
});


