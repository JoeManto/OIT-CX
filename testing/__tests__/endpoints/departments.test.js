/*
./node_modules/.bin/jest testing/__tests__/endpoints/auth.test.js
*/
const dbhandler = require('../../../Server/wrappers/MysqlWrapper');
const server_mock = require('../../mocks/server.mock');
const Employee = require('../../../Server/models/Employee');
const Department = require('../../../Server/models/Department');
const supertest = require('supertest');

const request = supertest(server_mock.app);
const test_key = server_mock.apiService.createKeyForUser('helpdesk-stu',true,9999999);

beforeEach(() => {
    
});
afterAll(async() => {
    //make sure the department is unlocked after each test to avoid errors
    let dep = new Department();
    await dep.apply({by:'groupName',value:'helpdesk'});
    dep.editLock(0).catch(err => console.log(err));

    //remove the temp position just in case it is still there
    dep.removePosition('test-pos').catch(err => console.log(err));

    dbhandler.db.destroy();
    server_mock.tearDown();
});

afterEach(async() => {
    
});

describe('Department Edit', () => {
    //successful department edit
    it('POST /department_edit_success', async() => {
        let data = [
            { type: 'select', key: 'Department', value: 'helpdesk'},
            { type: 'input', key: 'Department Name', value: 'helpdesk'},
            { type: 'input', key: 'Department Email', value: 'helpdesk-test@wmich.edu'}
        ]
        const res = await request
        .post('/editDepartment')
        .send({user:'helpdesk-stu',key:test_key,data:data})
        .expect(200);
        
        expect(res.body.res).toEqual('Department successfully updated.');
    });

    //fail department edit for a department that user does not belong to
    it('POST /department_edit_fail', async() => {
        let data = [
            { type: 'select', key: 'Department', value: 'labs'},
            { type: 'input', key: 'Department Name', value: 'helpdesk'},
            { type: 'input', key: 'Department Email', value: 'helpdesk-test@wmich.edu'}
        ]
        const res = await request
        .post('/editDepartment')
        .send({user:'helpdesk-stu',key:test_key,data:data})
        .expect(200);
        
        expect(res.body).toEqual(expect.objectContaining({
            error:'Permission Error',
            errorMessage:expect.any(String),
        }));
    });
});

describe('Department Lock', () => {
    //successful department lockout
    it('POST /department_lock_success', async() => {
        let data = [
            { type: 'select', key: 'Department', value: 'helpdesk'}
        ]
        const res = await request
        .post('/lockDepartment')
        .send({user:'helpdesk-stu',key:test_key,data:data})
        .expect(200);
        expect(res.body.res).toEqual('Department successfully locked.');
    });

     //unsuccessful department lockout - permession error
     it('POST /department_lock_fail', async() => {
        let data = [
            { type: 'select', key: 'Department', value: 'labs'}
        ]
        const res = await request
        .post('/lockDepartment')
        .send({user:'helpdesk-stu',key:test_key,data:data})
        .expect(200);
        expect(res.body).toEqual(expect.objectContaining({
            error:'Permission Error',
            errorMessage:expect.any(String),
        }));
    });
});

describe('Department Unlock', () => {
    //successful department unlock
    it('POST /department_unlock_success', async() => {
        let data = [
            { type: 'select', key: 'Department', value: 'helpdesk'}
        ]
        const res = await request
        .post('/unlockDepartment')
        .send({user:'helpdesk-stu',key:test_key,data:data})
        .expect(200);
        expect(res.body.res).toEqual('Department successfully unlocked.');
    });

     //unsuccessful department lockout - permission error
     it('POST /department_unlock_fail', async() => {
        let data = [
            { type: 'select', key: 'Department', value: 'labs'}
        ]
        const res = await request
        .post('/unlockDepartment')
        .send({user:'helpdesk-stu',key:test_key,data:data})
        .expect(200);
        expect(res.body).toEqual(expect.objectContaining({
            error:'Permission Error',
            errorMessage:expect.any(String),
        }));
    });
});

/*describe('Department Add', () => {
    //successfully add a department
    it('POST /department_add_success', async() => {
        let data = [
            { type: 'input', key: 'Department Name', value: 'testing-dep'}
        ]
    });

    //fail to add a department
    it('POST /department_add_fail', async() => {

    });
});

describe('Department Remove', () => {
    //successfully remove a department
    it('POST /department_remove_success', async() => {

    });

    //fail to remove a department - permission error
    it('POST /department_remove_fail', async() => {

    });
});
*/

describe('Add Position', () => {
    //successfully add a position to the current department of helpdesk-stu
    it('POST /position_add_success', async() => {
        let data = [
            { type: 'input', key: 'Position Name', value: 'test-pos'}
        ]
        const res = await request
        .post('/addPosition')
        .send({user:'helpdesk-stu',key:test_key,data:data})
        .expect(200);
        expect(res.body.res).toEqual('Position successfully added to helpdesk');

        dbhandler.query('delete from positions where posName = ?',{conditions:[
            'test-pos'
        ]});
    });
});

describe('Remove Position', () => {
    //successfully remove a position in the current department of helpdesk-stu
    it('POST /position_remove_success', async() => {

        await dbhandler.query('insert into positions (groupID,posName) values (?,?)',{conditions:[
            0,'test-pos',
        ]});

        let data = [
            { type: 'select', key: 'Position', value: 'test-pos'}
        ]
        const res = await request
        .post('/removePosition')
        .send({user:'helpdesk-stu',key:test_key,data:data})
        .expect(200);
        expect(res.body.res).toEqual('Position successfully removed from helpdesk');
    });
});