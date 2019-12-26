const dbhandler = require('../../../Server/wrappers/MysqlWrapper');
const Customer = require('../../../Server/models/Customer');

afterAll(()=>{
    dbhandler.db.destroy();
})


describe('Customer Functions', () => {




    it('Should apply/find customer data that is not in the db (vaild bnid)',async() => {

      //clean
      dbhandler.query("delete from customer where bnid = ?",{conditions:['jfj5666']});
      let customer = new Customer();

      //
      let data = await customer.apply('jfj5666');

      let condition = !(data instanceof Error);
      expect(condition).toBeTruthy();
    });

    it('Should fail to apply/find customer data that is unknown to ldap', async() => {

      //clean
      dbhandler.query("delete from customer where bnid = ?",{conditions:['dfs']});
      let customer = new Customer();

      //create an unknown user
      let condition = await customer.apply('dfs')
      .then(()=>true)
      .catch(()=>false);

      expect(condition).toBeFalsy();

    });
})
