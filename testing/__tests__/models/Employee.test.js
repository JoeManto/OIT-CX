const dbhandler = require('../../../Server/wrappers/MysqlWrapper');
const Employee = require('../../../Server/models/Employee');

const flushTestEmployee= () => {
  dbhandler.query("delete from users where empybnid = ?", { conditions: ['test-bnid'] });
};

const fetchTestEmployee = () => {
  return dbhandler.query("select * from users where empybnid = ?", { conditions: ['test-bnid'] });
};

const insertTestEmployee = async(options = {role:0,group:0}) => {
    dbhandler.query('insert into users (empyname,surname,password,role,empybnid,email,groupRole) values (?,?,?,?,?,?,?)',{
        conditions:[
            'Joe',
            'Test',
            null,
            options.role,
            'test-bnid',
            null,
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
           dbhandler.query('select * from grouproles where groupID = 0'),
        ]);
        
        expect(resolves[0] === resolves[1][0].emailList).toBeTruthy();
    });

    it('Should gather group email for labs employee', async () => {
    	await insertTestEmployee({role:0,group:1});

		let employee = new Employee()
		await employee.apply('test-bnid');

		let resolves = await Promise.all([
			employee.getEmailGroup(),
			dbhandler.query('select * from grouproles where groupID = 1'),
		]);

		expect(resolves[0] === resolves[1][0].emailList).toBeTruthy();
    });
});