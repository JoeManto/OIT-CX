const dbhandler = require('../../../Server/wrappers/MysqlWrapper');
const Customer = require('../../../Server/models/Customer');

const flushTestCustomer= () => {
  dbhandler.query("delete from customer where bnid = ?",{conditions:['jfj5666']});
}
const fetchTestCustomer = () => {
  return dbhandler.query("select * from customer where bnid = ?",{conditions:['jfj5666']});
}

afterEach(flushTestCustomer);

afterAll(()=>{
    dbhandler.db.destroy();
})

describe('Customer Function [apply]', () => {

    it('Should apply/find customer data that is stored in the db', async() => {

      //insert test user
      dbhandler.query("insert into customer (name,bnid,win) values ('Joe-Manto-Tests','jfj5666',12343242)");
      let customer = new Customer();

      let data = await customer.apply('jfj5666');

      let condition = !(data instanceof Error);
      expect(condition).toBeTruthy();

      expect(Object.values(customer.getData())).not.toContain(undefined);
    });

    it('Should apply/find customer data that is not in the db (vaild bnid)',async() => {

      let customer = new Customer();

      let data = await customer.apply('jfj5666');

      let condition = !(data instanceof Error);
      expect(condition).toBeTruthy();

      expect(Object.values(customer.getData())).not.toContain(undefined);
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

      expect(Object.values(customer.getData())).toContain(undefined);
    });
});

describe('Customer Function [create]', () => {
  it('Should not duplicate a user', async() => {
    await Promise.all(
    [
      dbhandler.query("insert into customer (name,bnid,win) values ('Joe-Manto-Tests','jfj5666',12343242)")
    ]);

    let res1 = await fetchTestCustomer();

    expect(res1.length).toBe(1);

    let customer = new Customer();
    let data = await customer.apply('jfj5666');

    let res2 = await fetchTestCustomer();

    expect(res2.length).toBe(1);
  });

  it('Should create db record for a new user', async() => {
    let customer = new Customer();
    await customer.apply('jfj5666');

    let res = await fetchTestCustomer();

    expect(res.length).toBe(1);
  });

  it('Should throw an error for an unknown new user', async() => {
    let customerLookUpError = await new Customer().apply('dfs')
    .then(res => false)
    .catch(err => true);

    expect(customerLookUpError).toBeTruthy();
  });

  it('Should save new customer data', async() => {
    await new Customer().apply('jfj5666');

    let res = await fetchTestCustomer();

    expect(res.length).toBe(1);
  });
});

describe('Customer Function [getData]', () => {
  let customer = new Customer();

  it.each([{name: undefined, bnid: 'ssg', win: '12343242'},
          {name: undefined, bnid: undefined, win: '12343242' },
          {name: undefined, bnid: undefined, win: undefined}])
  ('Should init data to undefined %#', (object) => {
      Object.assign(customer,object);
      expect(Object.values(customer.getData())).toContain(undefined);
  })
});
