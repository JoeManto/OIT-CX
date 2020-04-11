require('dotenv').config();

const express = require('express');
const https = require('https');
const fs = require('fs');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');

const config = require('../../Server/SecertConfig');
const ldapWrapper = require('../../Server/wrappers/LdapWrapper');
const newDb = require('../../Server/wrappers/MysqlWrapper');
const ApiKeyService = require('../../Server/services/ApiKeyService');
const Mail = require('../../Server/Emails/MailNew');

//models
const Customer = require('../../Server/models/Customer');
const Employee = require('../../Server/models/Employee');
const Shift = require('../../Server/models/Shift');
const User = require('../../Server/models/User');
const Department = require('../../Server/models/Department');
const CXError = require('../../Server/models/CXError');


//DataBase Connection Config
const db = mysql.createConnection(config.db_config());
console.log(config.db_config());

//Test DataBase Connection
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('mysql connected...');
});

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('client'));

//----------------------------SERVICES----------------------------------

let apiService = new ApiKeyService();//.api();
let mailService = new Mail();

//For Docker Build
app.use(express.static(path.join(__dirname, '../build')));
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

//-------------------------ENDPOINTS--------------------------------------
//Normal Build
app.get('/time', function (req, res) {
    //res.sendFile(path.join(__dirname + '/client'));
    let date = new Date();
    let temp = ""+date.toTimeString()+" | "+date.toLocaleDateString();
    res.send({res:temp});
});

/**
 * 
 */
app.post('/unAuth',(req,res) => {
   console.log("attempting to remove access for user "+req.body.user);
   if(!apiService.validHashedKeyForUser(req.body.user,req.body.key,false)){
        return res.send({res: "apiKey-error"});
   }

    apiService.expireOpenKeyForUser(req.body.user);
    console.log("removed user");
    res.send({res:"success"});
});

app.post('/auth', async(req,res) => {
    let {user,pass} = req.body;
      
    //query database for user-id
    let result = await newDb.userLookUp(user)
    .then(res => {return res[0]})
    .catch(err => res.send({res:"auth-failed",error:err}));

    if(result.locked === 1){
        return res.send({res: "auth-failed", error: "Account is locked"});
    }

    //no records from database : auth session user is unknown
    if(!result)
        return res.send({res: "auth-failed", error: "User Not-Found"});
    
    if(result.password === pass){
        //Create user instance and send a success full login response
        let key = apiService.createKeyForUser(user, result.role === 1,18000);
        return res.send({res: "auth-success", key: key});
    }

    /*
        User wasn't able to auth fully using the database
        
        *requires auth from lDAP
    */
    return ldapWrapper.authUser(user, pass)
            .then(_ => {
                //Create user instance and send a success full login response
                let key = apiService.createKeyForUser(user, result.role === 1,18000);
                return res.send({res: "auth-success", key: key});
            })
            .catch((err) => {
                return res.send(err);
            });
});

app.post('/getUsers', async(req, res) => {

    if(!apiService.validHashedKeyForUser(req.body.user, req.body.key,false))
        res.send({res: "apiKey-error"});

    //Query all users
    let result = await newDb.query("select empyname,surname,empybnid from users")
    .then(res => {return res})
    .catch(_ => {return undefined});

    //check if the query was valid
    if(!result || result.length === 0)
        return res.send({res: "user-error", error: "Couldn't search for user"});
    
    res.send({res: result});
});

/**
 * TODO: Change endpoint to searchCustomer 
 */
app.post('/searchUser',async(req,res) => {
    
    if(!apiService.validHashedKeyForUser(req.body.user, req.body.key,false)){
        return res.send({res: "apiKey-error"});   
    }

    new Customer().apply(req.body.userToLookUp)
    .then(data => {
        res.send({customerID:data[0].id,otherData:data[0]})
    })
    .catch(err => {
        res.send({res:'error',error: err});
    });
});

//Error Messages
// res.send({error:{error:"User Exists",errorMessage:"A user with the same bnid already exists in the database"}});

//Success Messages
// res.send({res:"Users Successfully added into the database"})

app.post('/addUser',async(req,res) => {
    if(!apiService.validHashedKeyForUser(req.body.user, req.body.key,true)) {
        return res.send({res: "apiKey-error"}); 
    }

    let values = req.body.data.map(obj => obj.value);

    let bnid = values[0];
    let role = values[2] === 'Normal' ?  0 : 1;
    let department = new Department();
    await department.apply({by:'groupName',value:values[1]});

    let employee = new Employee();
    let applyError = await employee.apply(req.body.user)
    .catch(err => err);

    if(applyError instanceof Error){
        return;
    }

    if(employee.getGroup() !== department.data.id){
        return res.send({error:"Permission Error",errorMessage:"Inserting users outside of your department isn't allowed."});
    }

    //check if user exists
    let employeeToAdd = new Employee();

    let error = await employeeToAdd.create(values[0],department.data.id,role)
    .then(_ => {
        return res.send({res:"User successfully added into the database."});
    })
    .catch(err => {
        res.send({error:err.type,errorMessage:err.description});
        return true;
    });
});

    /*
        [
            { type: 'input', key: 'Bronco Net-ID', value: 'jfj5666' },
            { type: 'input', key: 'First Name', value: 'joe' },
            { type: 'input', key: 'Last Name', value: 'manto' },
            { type: 'input', key: 'Email', value: 'joe.manto@wmich.edu' },
            { type: 'select', key: 'Department', value: 'classtech' },
            { type: 'select', key: 'User Role', value: 'Normal' }
        ]
    */
app.post('/editUser',async(req, res) => {
    let user = req.body.user;

    if (!apiService.validHashedKeyForUser(user, req.body.key,true)) {
        return res.send({res: "apiKey-error"}); 
    }

    let department = new Department();
    let employee = new Employee();
    let values = req.body.data.map(obj => obj.value);

    let bnid = values[0];
   
    await department.apply({by:'groupName',value:values[4]});

    await employee.apply(user);

    if(employee.getGroup() !== department.data.id){
        return res.send({error:"Permission Error",errorMessage:"editing users outside of your department isn't allowed."});
    }

    if((await employee.apply(bnid)) instanceof Error){
        return res.send({error:"User Not Found",errorMessage:"The Bnid '"+bnid+"' doesn't match any users."});
    }

    if(employee.getGroup() !== department.data.id){
        return res.send({error:"Permission Error",errorMessage:"That user is not in "+department.data.name+"department"});
    }

    let new_data = {
        empyname:values[1],
        surname:values[2],
        email:values[3],
        groupRole: department.data.id,
        role: values[5] === 'Normal' ? 0 : 1,
    };

    await employee.edit(new_data);

    res.send({res:"User data successfully edited."});
});


/*
        [
            { type: 'input', key: 'Bronco Net-ID', value: 'jfj5666' },
            { type: 'select', key: 'Department', value: 'classtech' },
        ]
*/
app.post('/lockUser',async(req, res) => {
    let user = req.body.user;
    let values = req.body.data.map(obj => obj.value);
    if (!apiService.validHashedKeyForUser(user, req.body.key,true)) {
        return res.send({res: "apiKey-error"}); 
    }
    
    let department = new Department();
    await department.apply({by:'groupName', value:values[1]});

    let employee = new Employee();
    await employee.apply(user);

    //check if groupId matches for the employee and whoever is making edits
    if(employee.getGroup() !== department.data.id){
        return res.send({error:"Permission Error",errorMessage:"editing users outside of your department isn't allowed."});
    }
    
    let error = await employee.apply(values[0])
    .catch(err => err);

    //check if user exists
    if(error instanceof Error){
        return res.send({error:"User Not Found",errorMessage:"The Bnid '"+values[0]+"' doesn't match any users."});
    }

    //check if groupId matches for the employee being edited
    if(employee.getGroup() !== department.data.id){
        return res.send({error:"Permission Error",errorMessage:"That user is not in "+department.data.name+"department"});
    }

    await employee.editLock(1);
    res.send({res:"User successfully locked"});

});

/*
        [
            { type: 'input', key: 'Bronco Net-ID', value: 'jfj5666' },
            { type: 'select', key: 'Department', value: 'classtech' },
        ]
*/
app.post('/unlockUser',async(req, res) => {
    let user = req.body.user;
    let values = req.body.data.map(obj => obj.value);
    if (!apiService.validHashedKeyForUser(user, req.body.key,true)) {
        return res.send({res: "apiKey-error"}); 
    }
    
    let department = new Department();
    await department.apply({by:'groupName', value:values[1]});

    let employee = new Employee();
    await employee.apply(user);

    //check if groupId matches for the employee and whoever is making edits
    if(employee.getGroup() !== department.data.id){
        return res.send({error:"Permission Error",errorMessage:"editing users outside of your department isn't allowed."});
    }
    
    let error = await employee.apply(values[0])
    .catch(err => err);

    //check if user exists
    if(error instanceof Error){
        return res.send({error:"User Not Found",errorMessage:"The Bnid '"+bnid+"' doesn't match any users."});
    }

    //check if groupId matches for the employee being edited
    if(employee.getGroup() !== department.data.id){
        return res.send({error:"Permission Error",errorMessage:"That user is not in "+department.data.name+"department"});
    }

    await employee.editLock(0);
    res.send({res:"User successfully unlocked."});

});

app.post('/addDepartment', async(req, res) => {
    let user = req.body.user;
    let values = req.body.data.map(obj => obj.value);

    if (!apiService.validHashedKeyForUser(user, req.body.key,true)) {
        return res.send({res: "apiKey-error"}); 
    }

    let employee = new Employee();
    let error = await employee.apply(values[1]);

    if(error instanceof Error){
        return res.send({error:"User Not Found",errorMessage:"The Bnid '"+values[1]+"' doesn't match any users."});
    }

    let department = new Department();
    let departments = await department.getAll();

    for(let i = 0;i<departments.length;i++){
        if(departments[i].groupName === values[0]){
            return res.send({error:"Duplicate Department",errorMessage:"The department name "+values[0]+" already exists"});
        }
    }

    await department.add({
        groupName:values[0],
        emailList:values[2],
        locked:0,
    });

    await department.apply({by:'groupName',value:values[0]});
    await employee.setGroup(department.data.id);
    employee.setRole(1);

    
    res.send({res:"Department successfully added."});
});

app.post('/editDepartment', async(req, res) => {
    let user = req.body.user;
    let values = req.body.data.map(obj => obj.value);
    if (!apiService.validHashedKeyForUser(user, req.body.key,true)) {
        return res.send({res: "apiKey-error"}); 
    }
    let department = new Department();
    await department.apply({by:'groupName', value:values[0]});

    let employee = new Employee();
    await employee.apply(user);

    if(employee.getGroup() !== department.data.id){
        return res.send({error:"Permission Error",errorMessage:"you cannot edit a department you are not a part of."});
    }

    let new_data = {
        groupName:values[1],
        emailList:values[2],
        locked:values[3],
    };
    await department.edit(new_data);
    res.send({res:"Department successfully updated."});
});

app.post('/lockDepartment', async(req, res) => {
    let user = req.body.user;
    let values = req.body.data.map(obj => obj.value);

    if (!apiService.validHashedKeyForUser(user, req.body.key,true)) {
        return res.send({res: "apiKey-error"}); 
    }

    let department = new Department();
    await department.apply({by:'groupName', value:values[0]});

    let employee = new Employee();
    await employee.apply(user);

    if(employee.getGroup() !== department.data.id){
        return res.send({error:"Permission Error",errorMessage:"you cannot edit a department you are not a part of."});
    }

    department.editLock(1);
    
    res.send({res:"Department successfully locked."});
});

app.post('/unlockDepartment', async(req, res) => {
    let user = req.body.user;
    let values = req.body.data.map(obj => obj.value);

    if (!apiService.validHashedKeyForUser(user, req.body.key,true)) {
        return res.send({res: "apiKey-error"}); 
    }

    let department = new Department();
    await department.apply({by:'groupName', value:values[0]});

    let employee = new Employee();
    await employee.apply(user);

    if(employee.getGroup() !== department.data.id){
        return res.send({error:"Permission Error",errorMessage:"you cannot edit a department you are not a part of."});
    }

    department.editLock(0);
    
    res.send({res:"Department successfully unlocked."});
});

app.post('/removeDepartment', async(req, res) => {
    let user = req.body.user;
    let values = req.body.data.map(obj => obj.value);

    if (!apiService.validHashedKeyForUser(user, req.body.key,true)) {
        return res.send({res: "apiKey-error"}); 
    }

    let department = new Department();
    await department.apply({by:'groupName', value:values[0]});

    let employee = new Employee();
    await employee.apply(user);

    let numUsers = await newDb.query('select * from users where groupRole = ?',{conditions:[department.data.id]});

    if(numUsers.length >= 2){
        if(employee.getGroup() !== department.data.id){
            return res.send({error:"Permission Error",errorMessage:"you cannot delete a department that you're not a part of because this department has more than one active user."});
        }
    }

    department.delete();
    res.send({res:"Department successfully deleted."});
});

/**
 * Endpoint for addPosition
 * position string 0
 */
app.post('/addPosition', async(req, res) => {
    let user = req.body.user;
    let values = req.body.data.map(obj => obj.value);

    if (!apiService.validHashedKeyForUser(user, req.body.key,true)) {
        return res.send({res: "apiKey-error"}); 
    }

    let employee = new Employee();
    await employee.apply(user);


    let department = new Department();
    await department.apply({by:'groupID', value:employee.getGroup()});
    
    department.addPosition(values[0]);
    res.send({res:"Position successfully added to " + department.data.name});
});

/**
 * Endpoint for removePosition
 * Should show a list of a positions in the current department
 */
app.post('/removePosition', async(req, res) => {
    let user = req.body.user;
    let values = req.body.data.map(obj => obj.value);

    if (!apiService.validHashedKeyForUser(user, req.body.key,true)) {
        return res.send({res: "apiKey-error"}); 
    }
    let employee = new Employee();
    await employee.apply(user);

    let department = new Department();
    await department.apply({by:'groupID', value:employee.getGroup()});
    
    department.removePosition(values[0]);
    res.send({res:"Position successfully removed from " + department.data.name});
});

app.post('/dataViewing',async(req,res) => {
    let employee = new Employee();
    await employee.apply(req.body.user);
    let groupID = employee.getGroup();

    let data = {
        userData:[],
        shiftData:[],
        helpdeskData:[],
    }

    let resolves = await Promise.all([
        newDb.query('select * from users where groupRole = ?',{conditions:[groupID]}),
        newDb.query('select * from positions where groupID = ?',{conditions:[groupID]}),
        newDb.query('select * from shifts INNER JOIN users ON shifts.postedBy = users.id where groupID = ?',{conditions:[groupID]}),
        newDb.query('select * from legacyshifts INNER JOIN users ON legacyshifts.postedBy = users.id where groupID = ?',{conditions:[groupID]}),
        newDb.query('select * from records INNER JOIN users on records.empyID = users.id'),
        newDb.query('select * from location'),
        newDb.query('select * from legacyrecords INNER JOIN users on legacyrecords.empyID = users.id'),
    ])

    //Add all user data
    let users = resolves[0];
    let positions = resolves[1];

    //------------------------------------Users
    users = users.map((obj) => {
        return {...obj,
            role:obj.role === 0 ? 'Normal' : 'Supervisor',
            locked:obj.locked === 0 ? 'UnLocked' : 'Locked',
            email:obj.email === null ? undefined : obj.email,
        };
    });

    //------------------------------------Shifts
    let activeShifts = resolves[2];
    let legacyShifts = resolves[3];

    let addShiftIntoData = async(shift,active) => {
        
        let startDate = new Date(Number(shift.shiftDateStart));
        let endDate = new Date(Number(shift.shiftDateEnd));

        let coveredBy = shift.coveredBy === null ? undefined : shift.coveredBy;
        let timeOfDay = 'am';
        let startTime = startDate.getHours();
        let endTime = endDate.getHours();
        let position = shift.positionID;

        if(coveredBy){
            let coverByEmployee = new User(undefined,'employee');
            await coverByEmployee.lookup({by:'id',value:shift.coveredBy});
            coveredBy = coverByEmployee.empybnid;
        }

        if(startTime >= 12){
            timeOfDay = 'pm';
            if(startTime !== 12){
                startTime-=12;
            }
        }

        if(endTime >= 12){
            if(endTime !== 12){
                endTime-=12;
            }
        }

        for(let i = 0;i<positions.length;i++){
            if(positions[i].id === position){
                position = positions[i].posName;
                break;
            }
        }

        let insertData = {
            requestor:shift.empybnid,
            coveredBy:coveredBy,
            startTime:startTime,
            endTime:endTime,
            timeOfDay:timeOfDay,
            day:startDate.getDate(),
            month:startDate.getMonth(),
            year:startDate.getFullYear(),
            shiftType:position,
            datePosted:shift.postedDate.toLocaleDateString(),
            active:active ? 'yes' : 'no',
        }

        data.shiftData.push(insertData);
    }

    for(let i = 0;i<activeShifts.length;i++){
        await addShiftIntoData(activeShifts[i],true);
    }

    for(let i = 0;i<legacyShifts.length;i++){
        await addShiftIntoData(legacyShifts[i],false);
    }

    //------------------------------------Records

    let records = resolves[4];
    let locations = resolves[5];
    let legacyrecords = resolves[6];
    let helpdeskRecordData = [];

    let insertRecordIntoData = async(record) => {

        let customer = new User(undefined,'customer');
        customer = await customer.lookup({by:'id',value:record.cosID})
        .catch(err => [{bnid:undefined}]);

        let location;
        for(let i = 0;i<locations.length;i++){
            if(locations[i].id === record.location){
                location = locations[i].locationName;
                break;
            }
        }

        let dataToInsert = {
            recordBy:record.empybnid,
            day:record.date.getDate(),
            month:record.date.getMonth(),
            year:record.date.getFullYear(),
            customer:customer[0].bnid,
            location:location,
        }

        helpdeskRecordData.push(dataToInsert);
    }

    for(let i = 0;i<records.length;i++){
        await insertRecordIntoData(records[i]);
    }

    for(let i = 0;i<legacyrecords.length;i++){
        await insertRecordIntoData(legacyrecords[i]);
    }

    data.userData = users;
    data.helpdeskData = helpdeskRecordData;
    res.send({res:data});
});

app.post('/postShift', (req, res) => {
    let postUserID = req.body.user;
    let shift = req.body.shiftDetails;

    if (apiService.validHashedKeyForUser(postUserID, req.body.key,false)) {
        let sqlUserLook = "select * from users where empybnid = ?";
        let sqlAddShift = "Insert into shifts (coveredBy,postedBy,availability,positionID," +
            "groupID,perm,shiftDateStart,shiftDateEnd,message) values (NULL,?,0,?,?,?,?,?,?)";
        let group;

        sqlUserLook = mysql.format(sqlUserLook, [postUserID]);
        db.query(sqlUserLook, (err, result) => {
            if (err) {
                return res.send({res: "shiftpost-error",error:err});
            }
            postUserID = result[0]['id'];
            group = result[0]['groupRole'];
            let user = result[0];
            if (shift.selectedPosition === null) shift.selectedPosition = 1;

            sqlAddShift = mysql.format(sqlAddShift, [postUserID,
                parseInt(shift.selectedPosition),
                group,
                shift.permShiftPosting === "off" ? 0 : 1,
                shift.date,
                shift.endDate,
                shift.message]);

            db.query(sqlAddShift, (err, _) => {
                if (err) {
                    return res.send({res: "shiftpost-error",error:err});
                } else {
                    db.query("select shiftDateEnd,shiftID from shifts where shiftID = (Select MAX(shiftID) from shifts)", async(err, result) => {
                        if (err) {
                            return res.send({res: "shiftpost-error",error:err});
                        }
                        let message = result[0]['shiftID'] + " " + result[0]['shiftDateEnd'];
                        //shiftServiceChild.send('ADD ' + message);

                        let shiftID = result[0]['shiftID'];
                        let shiftToPost = new Shift();
                        await shiftToPost.apply(shiftID);

                        mailService.sendShiftPosting(shiftToPost);
                    });

                    //mailService.sendMail(shift,user,group);
                    //mailService.sendShiftPosting(shift,user,group);
                    res.send({res: "success"});
                }
            });
        });
    } else {
        res.send({res: "apiKey-error"});
    }
});

app.post('/pickUpShift', (req, res) => {
    let pickUpUser = req.body.user;
    let shiftId = req.body.shiftId;

    if (apiService.validHashedKeyForUser(pickUpUser, req.body.key, false)) {
        let sqlCheckShift = "Select * from shifts where shiftId = ? AND availability = 0";
        sqlCheckShift = mysql.format(sqlCheckShift, [shiftId]);
        db.query(sqlCheckShift, (err, result) => {
            if (err) {
                res.send({res: "shift-error"});
                return;
            }
            if (result.length === 0) {
                res.send({res: "shift-not-found"});
                return;
            }
            let sqlUserLook = "select id from users where empybnid = ?";
            sqlUserLook = mysql.format(sqlUserLook, [pickUpUser]);
            db.query(sqlUserLook, (err, result) => {
                if (err) {
                    res.send({res: "shift-error"});
                    return;
                }
                pickUpUser = result[0]['id'];

                let sqlCover = "update shifts set availability = 1, coveredBy = ? where shiftId = ?";
                sqlCover = mysql.format(sqlCover, [pickUpUser, shiftId]);
                db.query(sqlCover, (err, result) => {
                    if (err) {
                        res.send({res: "shift-error"});
                        return;
                    }

                    //Send Email
                    let shift = new Shift();
                    
                    let sendSync = async() =>{
                        await shift.apply(shiftId);
                        mailService.sendCoveredShift(shift);
                    } 
                    sendSync();
                    
                    res.send({res: "success"})
                })
            })
        })
    } else {
        res.send({res: "apiKey-error"});
    }
});

app.post('/deleteShift', (req, res) => {
    if (apiService.validHashedKeyForUser(req.body.user, req.body.key, false)) {
        let shiftId = req.body.shiftId;
        let sqlShiftRemove = "Delete from shifts where shiftId = ?";
        sqlShiftRemove = mysql.format(sqlShiftRemove, [shiftId]);
        db.query(sqlShiftRemove, (err, result) => {
            if (err || result.affectedRows === 0) {
                return res.send({res: "shift-error"});
            }
            res.send({res: "success"});
        })
    } else {
        res.send({res: "apiKey-error"});
    }
});

app.post('/getShifts', (req, res) => {
    let groupRole = null;
    let userId = null;
    let covered = req.body.covered;
    let isPermPosting = 0;

    if(covered === 2){
      isPermPosting = 1;
      covered = 0;
    }

    if (apiService.validHashedKeyForUser(req.body.user, req.body.key, false)) {
        let sqlGroupRole = "Select groupRole,id from users where empybnid = ?";
        sqlGroupRole = mysql.format(sqlGroupRole, [req.body.user]);
        db.query(sqlGroupRole, (err, result) => {
            if (err) {
                res.send({res: "User-Missing"});
                return;
            }
            groupRole = result[0]['groupRole'];
            userId = result[0]['id'];

            let sqlShifts = "Select shiftId,coveredBy,postedBy,postedDate,availability,positionID," +
                "perm,shiftDateStart,shiftDateEnd,empyname,empybnid from shifts t1,users t2 where" +
                " groupId = ? AND t1.postedBy = t2.id AND availability = ? AND perm = ? ORDER BY shiftDateStart ASC;";

            let sqlUsers = "SELECT * FROM users where groupRole = "+groupRole;

            sqlShifts = mysql.format(sqlShifts, [groupRole, covered,isPermPosting]);
            db.query(sqlShifts, (err, result) => {
                if (err) {
                    res.send({res: "User-Missing"});
                }
                db.query(sqlUsers,(err,result2) => {
                    result.map((obj,i) => {
                      for(let i = 0;i<result2.length;i++){
                        if(result2[i].id === obj.coveredBy){
                          obj.coveredBy = result2[i].empybnid;
                          Object.assign(obj,{coveredByName:result2[i].empyname});
                        }
                      }
                   })
                   res.send({res: result})
                })
            });
        });


    } else {
        res.send({res: "apiKey-error"});
    }
});

app.post('/getDepartments', async(req, res) => {
    
    if (!apiService.validHashedKeyForUser(req.body.user, req.body.key,true)) {
        return res.send({res: "apiKey-error"}); 
    }

    let department = new Department();

    res.send({res:await department.getAll()});
});

app.post('/getPositions', (req, res) => {
    if (apiService.validHashedKeyForUser(req.body.user, req.body.key, false)) {
        let user = req.body.user;
        let roleChecksql = "Select role,groupRole from users where empybnid = ?";
        roleChecksql = mysql.format(roleChecksql, [user]);
        db.query(roleChecksql, (err, result) => {
            if (err) {
                res.send({res: "User-Missing"});
                return;
            }
            let userInfo = {user: user, role: result[0]['role'], groupId: result[0]['groupRole']};
            /*if ((userInfo.role === 1 || userInfo.role === 2) && !req.body.fetchAll) {
                res.send({res: []});
                return;
            }*/
            if(req.body.fetchAll){
                let positionsSql = "Select id,posName from positions";
                positionsSql = mysql.format(positionsSql, [userInfo.groupId]);
                db.query(positionsSql, (err, result) => {
                    if (err) {
                        res.send({"res": "User-Missing"});
                    }
                    console.log("this is the result from the server"+result);
                    res.send({res: result});
                });
            }else{
                let positionsSql = "Select id,posName from positions where groupId = ?";
                positionsSql = mysql.format(positionsSql, [userInfo.groupId]);
                db.query(positionsSql, (err, result) => {
                    if (err) {
                        res.send({"res": "User-Missing"});
                    }
                    res.send({res: result});
                });
            }
        });
    } else {
        res.send({res: "apiKey-error"});
    }
});

app.post('/rec', (req, res) => {
    if (apiService.validHashedKeyForUser(req.body.cookieUser, req.body.key, false)) {
        if (req.body.user) {
            let sql = "Select cosID,empyID,date,name,win,bnid,empybnid,empyname from records" +
                " t1,customer t2,users t3 where (t1.cosID = t2.id && t1.empyID = t3.id && empybnid = ?) ORDER BY date DESC";
            sql = mysql.format(sql, [req.body.user]);
            db.query(sql, (err, result) => {
                if (err) {
                    res.send({res: "date-invalid"});
                    return;
                }
                res.send({res: result});
            });
        } else {
          let sql = "Select cosID,empyID,date,name,win,bnid,empybnid,empyname from records" +
               " t1,customer t2,users t3 where (t1.cosID = t2.id && t1.empyID = t3.id) ORDER BY date DESC";
            sql = mysql.format(sql, [req.body.date]);
            db.query(sql, (err, result) => {
                if (err) {
                    res.send({res: "date-invalid"});
                    return;
                }
                res.send({res: result});
            });
        }
    } else {
        res.send({res: "apiKey-error"});
    }
});

app.post('/addRec',(req,res) =>{
    if (apiService.validHashedKeyForUser(req.body.user, req.body.key, false)) {
        let userIdSql = "select id from users where empybnid = ?"
        db.query(mysql.format(userIdSql,[req.body.user]),(err,result) => {
            if(err || result.length === 0){
              res.send({error:"mysql-error"});
              return;
            }
            let insertSql = "insert into records (cosID,empyID,location,date) values (?,?,?,?)";
            db.query(mysql.format(insertSql,[req.body.customerID,result[0].id,req.body.location,req.body.date]),(err,result) => {
              if(err){
                console.log(err);
                res.send({error:"mysql-error"});
              }
            })
        });
    }else {
        res.send({res: "apiKey-error"});
    }
});

app.post('/locations',(req,res)=>{
  if (apiService.validHashedKeyForUser(req.body.user, req.body.key, false)) {
    db.query("select * from location",(err,result)=>{
      if(err){
        res.send({res: "sql-error"});
      }else{
        res.send({res:result});
      }
    });
  }else{
    res.send({res: "apiKey-error"});
  }
});

app.post('/editEnvironmentVariable', async(req,res) => {
    if(!apiService.validHashedKeyForUser(req.body.user, req.body.key, true)){
        res.send({res: "apiKey-error"});
    }

    let data = req.body.data[0];
    let varName = "";

    if(data.key === "New Email Password"){
        varName = "PASS_EMAIL";
    }else if (data.key === "New LDAP Password"){
        varName = "PASS_LDAP";
    }else{
        return res.send({error:"SQL Error",errorMessage:"Data received by client fails condition check"});
    }

    let result = await newDb.query('select * from env where varName = ?',{conditions:[varName]});

    if(result.length === 0){
        newDb.query("insert into env (varType,varName,varValue) values ('string',?,?)",{conditions:[
            varName,
            data.value,
        ]})
        .catch(err => res.send({error:'SQL Error',errorMessage:'Error Inserting into env table'}));
        res.send({res:"Successfully inserted new environment override"});
    }else {
        newDb.query('update env set varValue = ? where varName = ?',{conditions:[
            data.value,
            varName,
        ]}).catch(err => res.send({error:'SQL Error',errorMessage:'Error updating env table'}));
        res.send({res:"Successfully updated environment override"});
    }
});

app.post('/tests',async(req,res) => {
    if(!apiService.validHashedKeyForUser(req.body.user, req.body.key, true)){
        res.send({res: "apiKey-error"});
    }
    return res.send({helloWorld:req.body.testMessage});
});

const server_instance = app.listen(7304);

let tearDown = () => {
    db.destroy();
    newDb.db.destroy();
    server_instance.close();
}

module.exports = {app:app,apiService:apiService,tearDown:tearDown};