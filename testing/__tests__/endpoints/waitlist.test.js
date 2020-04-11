/*
./node_modules/.bin/jest testing/__tests__/endpoints/auth.test.js
*/
const dbhandler = require('../../../Server/wrappers/MysqlWrapper');
const server_mock = require('../../mocks/server.mock');
const Employee = require('../../../Server/models/Employee');
const Customer = require('../../../Server/models/Customer');
const Department = require('../../../Server/models/Department');
const supertest = require('supertest');

const request = supertest(server_mock.app);
const test_key = server_mock.apiService.createKeyForUser('helpdesk-stu',true,9999999);

beforeEach(() => {
    
});

afterAll(async() => {
    dbhandler.db.destroy();
    server_mock.tearDown();
});

//test for walk in records to be returned for a specific user
describe('Walk-in Records Get', () => {
    it('POST /rec_success', async() => {
        const res = await request
        .post('/rec')
        .send({cookieUser:'helpdesk-stu', key:test_key})
        .expect(200);
        
        expect(Array.isArray(res.body.res)).toBeTruthy();
    });
});

//test for adding a record for of a walk-in
describe('Add Walk-In Record', () => {
    it('POST /rec_add_success', async() => {

        //get customer ID
        let cus = new Customer();
        await cus.apply('jsb5633');
        
        //get employee ID
        let emp = new Employee();
        await emp.apply('helpdesk-stu');

        //console.log(cus.id);
        //console.log(emp.data);

        const res = await request
        .post('/addRec')
        .send({user:'helpdesk-stu', key:test_key, customerID:cus.id,location:0, date:'2020-04-10 21:24:01'})
        .expect(200);

        expect(res.body.res).toEqual('success');
    });
});

//locations test
describe('Locations Endpoint Test', () => {
    it('POST /locations_listAll', async() => {
        const res = await request
        .post('/locations')
        .send({user:'helpdesk-stu', key:test_key})
        .expect(200);
        expect(Array.isArray(res.body.res)).toBeTruthy();
    });
});