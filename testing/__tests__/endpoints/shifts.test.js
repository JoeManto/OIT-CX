/*
./node_modules/.bin/jest testing/__tests__/endpoints/shifts.test.js
*/
const dbhandler = require('../../../Server/wrappers/MysqlWrapper');
const server_mock = require('../../mocks/server.mock');
const Shift = require('../../../Server/models/Shift');
const supertest = require('supertest');

const request = supertest(server_mock.app);
const test_key = server_mock.apiService.createKeyForUser('helpdesk-stu',true,9999999);

let testShiftData = {
    coveredBy:null,
    postedBy:25,
    postedDate:'2020-01-01 18:06:47',
    availability:0,
    positionID:1,
    groupID:0,
    perm:0,
    message:'',
}

const insertTestValidShift = async() => {
    let today = new Date();
    let end = new Date();
    end.setDate(today.getDate() + 1);

    let shiftData = {...testShiftData,
        shiftDateEnd:end,
        shiftDateStart:today,
    }

    return new Shift().create(shiftData);
}

beforeEach(() => {

});

afterAll(() => {
    dbhandler.db.destroy();
    server_mock.tearDown();
});

describe('Shift Deletion',() => {
    
    it('POST /deleteShift_success',async() => {

        const newShiftID = await insertTestValidShift();

        const res = await request
        .post('/deleteShift')
        .send({user:'helpdesk-stu',key:test_key,shiftId:newShiftID})
        .expect(200);
        
        expect(res.body.res).toEqual('success');
    });
    
    it('POST /deleteShift_invalidID',async() => {

        const res = await request
        .post('/deleteShift')
        .send({user:'helpdesk-stu',key:test_key,shiftID:-1})
        .expect(200);

        expect(res.body.res).toEqual('shift-error');
    });

});

/* Example shiftDetails
{
  date: 1587681911483,
  endDate: 1587693611477,
  positionData: [
    { id: 1, posName: 'Walk-In' },
    { id: 2, posName: 'Mobile' },
    { id: 3, posName: 'Call-In' }
  ],
  selectedPosition: '2',
  overNightWarning: { status: false, message: '' },
  longShiftWarning: { status: false, message: '' },
  shiftInputFailure: { status: false, message: '', pointer: null },
  message: '',
  permShiftPosting: 'off',
  confirmStatus: 'untested'
}
*/
describe('Shift Insertion', () => {

    it('POST /postShift_success',async() => {

        const shiftDetails = {
            date:new Date().getTime(),
            endDate: new Date().getTime(),
            selectedPosition: '2',
            message: '',
            permShiftPosting: 'off',
        }

        const res = await request
        .post('/postShift')
        .send({user:'helpdesk-stu',key:test_key,shiftDetails:shiftDetails})
        .expect(200);

        expect(res.body.res).toEqual('success');
    });

    it('POST /postShift_shift',async() => {

        const shiftDetails = {
            date:new Date().getTime(),
            endDate: new Date().getTime(),
            selectedPosition: '2',
            message: '',
            permShiftPosting: 'off',
        }

        const res = await request
        .post('/postShift')
        .send({user:'helpdesk-stu',key:test_key,shiftDetails:shiftDetails})
        .expect(200);

        expect(res.body.res).toEqual('success');
    })
});

describe('Get Shifts', () => {
    it('POST /getShifts_success', async() => {

        const res = await request
        .post('/getShifts')
        .send({user:'helpdesk-stu',key:test_key})
        .expect(200);

        expect(res.body).toEqual(expect.objectContaining({
            res:expect.anything(),
        }));
    });
});

describe('Pick Up Shift',() => {
    it('POST /pickUpShift_success', async() => {

        const newShiftID = await insertTestValidShift();

        const res = await request
        .post('/pickUpShift')
        .send({user:'helpdesk-stu',key:test_key,shiftId:newShiftID})
        .expect(200);

        expect(res.body.res).toEqual('success');
    });

    it('POST /pickUpShift_invalidID', async() => {
        const res = await request
        .post('/pickUpShift')
        .send({user:'helpdesk-stu',key:test_key,shiftId:-1})
        .expect(200);

        expect(res.body.res).toEqual('shift-not-found');
    });
})