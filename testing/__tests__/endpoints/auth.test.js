/*
./node_modules/.bin/jest testing/__tests__/endpoints/auth.test.js
*/
const dbhandler = require('../../../Server/wrappers/MysqlWrapper');
const server_mock = require('../../mocks/server.mock');
const supertest = require('supertest');

const request = supertest(server_mock.app);
let test_key = '';

beforeEach(() => {
    test_key = server_mock.apiService.createKeyForUser('helpdesk-stu',true,9999999);
});

afterAll(() => {
    dbhandler.db.destroy();
    server_mock.tearDown();
});

describe('Authentication Endpoints' , () => {

    it('POST /auth', async() => {
        const res = await request
        .post('/auth')
        .send({user:'helpdesk-stu',pass:'123456'})
        .expect(200);
        
        console.log(res.body.error);

        expect(res.body.res).toEqual('auth-success');
    });

    it('POST /unauth', async() => {
        const res = await request
        .post('/unauth')
        .send({user:'helpdesk-stu',key:test_key})
        .expect(200);

        expect(res.body.res).toEqual('success');
    });
});