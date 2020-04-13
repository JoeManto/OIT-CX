const dbhandler = require('../../../Server/wrappers/MysqlWrapper');
const Employee = require('../../../Server/models/Employee');

const flushTestEmployee= () => {
  dbhandler.query("delete from users where empybnid = ?", { conditions: ['test-bnid'] });
};

const fetchTestEmployee = () => {
  return dbhandler.query("select * from users where empybnid = ?", { conditions: ['test-bnid'] });
};

const insertTestEmployee = async(options = {bnid:'test-bnid',role:0,group:0,email:null}) => {
    dbhandler.query('insert into users (empyname,surname,password,role,empybnid,email,groupRole) values (?,?,?,?,?,?,?)',{
        conditions:[
            'Joe',
            'Test',
            null,
            options.role,
            options.bnid,
            options.email,
            options.group,
        ],
    });
};

afterEach(flushTestEmployee);

afterAll(() => {
  dbhandler.db.destroy();
});

describe('getEmailGroup Function', () => {

    it('Should gather group email for helpdesk employee', async () => {
        
        await insertTestEmployee();

        let employee = new Employee();
        await employee.apply('test-bnid');

        let resolves = await Promise.all([
           employee.getEmailGroup(),
           dbhandler.query('select * from groupRoles where groupID = 0'),
        ]);
        
        expect(resolves[0] === resolves[1][0].emailList).toBeTruthy();
    });

    it('Should gather group email for labs employee', async () => {
    	await insertTestEmployee({bnid:'test-bnid',role:0,group:1,email:null});

		let employee = new Employee();
		await employee.apply('test-bnid');

		let resolves = await Promise.all([
			employee.getEmailGroup(),
			dbhandler.query('select * from groupRoles where groupID = 1'),
		]);

		expect(resolves[0] === resolves[1][0].emailList).toBeTruthy();
    });
});


describe('getEmail Function', () => {
  	it('Should return the email of the employee in the database', async() => {

		await insertTestEmployee({bnid:'test-bnid',role:0,group:1,email:"test.email@wmich.edu"});
		let employee = new Employee();
		await employee.apply('test-bnid');
		
		let resolves = await Promise.all([
			await employee.getEmail(),
			dbhandler.query("select * from users where empybnid = ?",{conditions:['test-bnid']}),
		]);
		
		expect(resolves[0] === resolves[1][0].email).toBeTruthy();
	 });
	 
	 it('Should return the email of the employee using ldap', async() => {
		await insertTestEmployee({bnid:'dhd5021',role:0,group:0,email:null});
		
		let employee = new Employee();
		await employee.apply('dhd5021');

		let resolves = [await employee.getEmail()];
		resolves.push(await dbhandler.query("select * from users where empybnid = ?",{conditions:['dhd5021']}));
		
		expect(resolves[0] === resolves[1][0].email).toBeTruthy();

		await dbhandler.query('delete from users where empybnid = ?',{conditions:['dhd5021']});
	 });
});