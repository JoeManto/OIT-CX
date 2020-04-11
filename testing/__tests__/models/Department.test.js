const dbhandler = require('../../../Server/wrappers/MysqlWrapper');
const Department = require('../../../Server/models/Department');
const Employee = require('../../../Server/models/Employee');
const CXError = require('../../../Server/models/CXError');

const dep = new Department();

afterEach(async() => {
    await flushTestDepartment();
});

afterAll(async() => {
    dbhandler.db.destroy();
});

beforeAll(async() => {
    
});

const insertTestDepartment = async() => {
    await dep.add({emailList:'test-email@wmich.edu',groupName:'test-dep',locked:0});
}


const flushTestDepartment = async() => {
    await dbhandler.query('delete from groupRoles where groupName = ?',{conditions:['test-dep']});
    await dbhandler.query('delete from positions where posName = \'test-pos\'');
    await dbhandler.query('delete from users where empybnid = ?',{conditions:['test-bnid']});
}

describe('Department Function [add]', () => {
    it('Should insert department and apply department data', async() => {

        insertTestDepartment();

        expect(dep.data).toEqual(expect.objectContaining({
            email:expect.any(String),
            name:expect.any(String),
            id:expect.any(Number),
        }));
    });
});

describe('Department Function [apply]', () => {
    it('Should find department and apply department data', async() => {

        await insertTestDepartment();

        await dep.apply({by:'groupName',value:'test-dep'});

        expect(dep.data).toEqual(expect.objectContaining({
            email:expect.any(String),
            name:expect.any(String),
            id:expect.any(Number),
        }));
    });

    it('Should fail to find a department and apply department data that is unknown', async() => {

        await dep.apply({by: 'groupName',value:'thisDepartmentNameIsUnknown'}).catch(err => {
            expect(err instanceof CXError).toBeTruthy();
        });
    });
});

describe('Department Function [editLock]', () => {
    it('Should lock and unlock a department and users', async() => {
        //insert test user into department

        await insertTestDepartment();

        await dep.apply({by:'groupName',value:'test-dep'});

        let emp = new Employee();
        await emp.create('test-bnid',dep.data.id,0,true);
        await emp.apply('test-bnid');

        await dep.editLock(1);

        await Promise.all([
            dep.refresh(),
            emp.refresh(),
        ]);

        expect(dep.data.locked).toBe(1);
        expect(emp.data.locked).toBe(1);

        await dep.editLock(0);

        await Promise.all([
            dep.refresh(),
            emp.refresh(),
        ]);

        expect(dep.data.locked).toBe(0);
        expect(emp.data.locked).toBe(0);
    });
});

describe('Department Function [delete]', () => {
    it('Should delete a department and all of its users', async() => {
        await insertTestDepartment();

        await dep.apply({by:'groupName',value:'test-dep'});

        await dep.addPosition('test-pos');

        let emp = new Employee();
        await emp.create('test-bnid',dep.data.id,0,true);
        await emp.apply('test-bnid');

        await dep.delete();
        
        let result = await dbhandler.query('select * from groupRoles where groupName = ?',{conditions:['test-dep']});
        expect(result.length).toBe(0);
    });
})

describe('Department Function [addPosition]', () => {
    it('Should add a position to a department', async() => {
        //add test department and apply it
        await insertTestDepartment();
        await dep.apply({by:'groupName',value:'test-dep'});
        
       await dep.addPosition('test-pos');
       let result = await dbhandler.query('select * from positions where groupID = ? and posName = ?', {conditions:[dep.data.id, 'test-pos']});
       expect(result.length).toBe(1);
    });
});

describe('Department Function [removePosition]', () => {
    it('Should remove a position from a department', async() => {
        //add test department and apply it
        await insertTestDepartment();
        await dep.apply({by:'groupName',value:'test-dep'});
        
       await dep.addPosition('test-pos');
      
       await dep.removePosition('test-pos');
       let result = await dbhandler.query('select * from positions where groupID = ? and posName = ?', {conditions:[dep.data.id, 'test-pos']});
       expect(result.length).toBe(0);
    });
});

describe('Department Function [editPosition]', () => {
    it('Should edit a position in a department', async() => {
        //add test department and apply it
        await insertTestDepartment();
        await dep.apply({by:'groupName',value:'test-dep'});
        let changed_data = {
            email: 'changedemail@wmich.edu',
            groupName: 'changed-dep',
            locked: 0
        };
       await dep.edit(changed_data);

       console.log(dep.data);

       expect(dep.data.email).toEqual(changed_data.email);
       expect(dep.data.name).toEqual(changed_data.groupName);
       expect(dep.data.locked).toEqual(changed_data.locked);
    });
});