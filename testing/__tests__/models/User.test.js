const dbhandler = require('../../../Server/wrappers/MysqlWrapper');
const User = require('../../../Server/models/User');
const Customer = require('../../../Server/models/Customer');

const testCustomer = {
    bnid:'testBnid',
    win:123456789,
    name:'Joe-Manto',
}

const flushTestCustomer = () => {
    dbhandler.query("delete from customer where bnid = ?", { conditions: [testCustomer.bnid] });
};
const fetchTestCustomer = () => {
    return dbhandler.query("select * from customer where bnid = ?", { conditions: [testCustomer.bnid] });
};
const insertTestCustomer = async() => {
    dbhandler.query("insert into customer (name,bnid,win) values ('"+testCustomer.name+"','"+testCustomer.bnid+"',"+testCustomer.win+")");
};

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

    it.skip('Should find customer records by id', async() => {
        let customer = new User(undefined,'customer');

        //Assumes Data customer with id 686 exists
        let data = await customer.lookup({by:'id',value:'686'});

        expect(data).not.toBe(undefined);
    });
});

describe('Delete Function', () => {
    it('Should delete a customer record from the database', async() => {

        flushTestCustomer();
        
        await insertTestCustomer();

        let customer = new Customer();

        await customer.apply({by:'bnid',value:testCustomer.bnid});

        customer.bnid = testCustomer.bnid;

        await customer.delete();

        let result = await fetchTestCustomer();

        expect(result.length).toBe(0);     
    });
});


