/*
./node_modules/.bin/jest testing/__tests__/endpoints/auth.test.js
*/
const dbhandler = require('../../../Server/wrappers/MysqlWrapper');
const server_mock = require('../../mocks/server.mock');
const Employee = require('../../../Server/models/Employee');
const supertest = require('supertest');

const request = supertest(server_mock.app);
const test_key = server_mock.apiService.createKeyForUser('helpdesk-stu',true,9999999);

beforeEach(() => {
    
});
afterAll(() => {
    dbhandler.db.destroy();
    server_mock.tearDown();
});

afterEach(async() => {
    let emp = new Employee();
    await emp.apply('helpdesk-stu');
    emp.editLock(0).catch(err => console.log(err)); //make sure they employee is unlocked after each test
});

describe('User Locking', () => {
    //this test should pass with the proper data being passed in
    it('POST /user_lock_success', async() => {
        let data = [
            { type: 'input', key: 'Bronco Net-ID', value: 'helpdesk-stu' },
            { type: 'select', key: 'Department', value: 'helpdesk' },
        ]

        const res = await request
        .post('/lockUser')
        .send({user:'helpdesk-stu',key:test_key,data:data})
        .expect(200);

        expect(res.body.res).toEqual('User successfully locked');
    });

    //this test should fail as the user does not have the correct department selected
    it('POST /user_lock_permission_denied', async() => {
        let data = [
            { type: 'input', key: 'Bronco Net-ID', value: 'helpdesk-stu' },
            { type: 'select', key: 'Department', value: 'labs' },
        ]

        const res = await request
        .post('/lockUser')
        .send({user:'helpdesk-stu',key:test_key,data:data})
        .expect(200);


        expect(res.body).toEqual(expect.objectContaining({
            error:'Permission Error',
            errorMessage:expect.any(String),
        }));
    });

    //unknown BNID
    it('POST /user_lock_unknown_user', async() => {
        let data = [
            { type: 'input', key: 'Bronco Net-ID', value: 'a-stu' },
            { type: 'select', key: 'Department', value: 'helpdesk' },
        ]

        const res = await request
        .post('/lockUser')
        .send({user:'helpdesk-stu',key:test_key,data:data})
        .expect(200);

        expect(res.body).toEqual(expect.objectContaining({
            error:'User Not Found',
            errorMessage:expect.any(String),
        }));
    });
});

describe('User unlocking', () => {
    it('POST /user_unlock_success', async() => {
        let data = [
            { type: 'input', key: 'Bronco Net-ID', value: 'helpdesk-stu' },
            { type: 'select', key: 'Department', value: 'helpdesk' },
        ]

        const res = await request
        .post('/unlockUser')
        .send({user:'helpdesk-stu',key:test_key,data:data})
        .expect(200);

        expect(res.body.res).toEqual('User successfully unlocked.');
    });
});

describe('User Edit', () => {
    it('POST /user_edit_success', async() => {
        let data = [
            { type: 'input', key: 'Bronco Net-ID', value: 'helpdesk-stu' },
            { type: 'input', key: 'First Name', value: 'test-helpdesk-stu' },
            { type: 'input', key: 'Last Name', value: 'helpdesk-surname' },
            { type: 'input', key: 'Email', value: 'helpdesk-test@wmich.edu' },
            { type: 'select', key: 'Department', value: 'helpdesk' },
            { type: 'select', key: 'User Role', value: 'Normal' }
        ]
        const res = await request
        .post('/editUser')
        .send({user:'helpdesk-stu',key:test_key,data:data})
        .expect(200);
        expect(res.body.res).toEqual('User data successfully edited.');
    });
});

describe('User Add', () => {
    it('POST /userAdd_success', async() => {

        await dbhandler.query('delete from users where empybnid = ?',{conditions:[
            'jfj5666',
        ]});

        let data = [
            { type: 'input', key: 'Bronco Net-ID', value: 'jfj5666' },
            { type: 'select', key: 'Department', value: 'helpdesk' },
            { type: 'select', key: 'User Role', value: 'Supervisor' }
        ]
        const res = await request
        .post('/addUser')
        .send({user:'helpdesk-stu',key:test_key,data:data})
        .expect(200);
        
        expect(res.body.res).toEqual('User successfully added into the database.');
    });
    
    it('POST /userAdd_LDAP_Error', async() => {
        let data = [
            { type: 'input', key: 'Bronco Net-ID', value: 'test-user' },
            { type: 'select', key: 'Department', value: 'helpdesk' },
            { type: 'select', key: 'User Role', value: 'Normal' }
        ]
        const res = await request
        .post('/addUser')
        .send({user:'helpdesk-stu',key:test_key,data:data})
        .expect(200);

        console.log(res.body.error);
        console.log(res.body.errorMessage);

        expect(res.body).toEqual(expect.objectContaining({
            error:'LDAP Error',
            errorMessage:expect.any(String),
        }));
    });
});

