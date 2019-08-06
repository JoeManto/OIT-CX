const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');
const LDAPConfig = require('./LDAPConfig');
const ldapWrapper = require('./Ldapwrapper');
const ApiKeyService = require('./ApiKeyService');
const Mail = require('./Mail');

const cp = require('child_process');
const shiftServiceChild = cp.fork('Server/ShiftService.js');

//DataBase Connection Config
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'nodemysql'
});

//Test DataBase Connection
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('mysql connected...');
});

//Gather Hidden LDAPConfig
/*
    url: 'ldaps://host.name',
    dn: '[user to bind]',
    bn: '[search base]',
    ip: 'x------x',
    port: ':636',
    pw: 'x------x',
 */
let ldapConfig = LDAPConfig.config();

//---LDAP Connection options for a new LDAPAuth Object with LDAP config options
/*
    Change TLS options to the options that are appropriate for your LDAP server
*/
let options = {
    url: ldapConfig.url + ldapConfig.port,
    bindDN: ldapConfig.dn,
    bindCredentials: ldapConfig.pw,
    searchBase: ldapConfig.bn,
    searchFilter: 'uid=blank',
    searchAttributes: ['sn'],
    tlsOptions: {
        minVersion: 'TLSv1',
    }
};

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('client'));

//--------------------------------------------------------------

function callRecurringProcesses(){
    shiftServiceChild.send('CHECK');
}

setInterval(()=>{shiftServiceChild.send('CHECK');}, 20000);
setInterval(()=>{shiftServiceChild.send('PRUNE');}, 200000);

shiftServiceChild.on('message',function (m) {
    console.log('[AUTO][SHIFT WORKER] : ' + m);
});

let apiService = new ApiKeyService();

//let mailService = new Mail();
/*mailService.sendMail(mailService.createShiftPosting({poster:"Joseph Manto"},
    {start:new Date(),end:new Date(),type:"walk-in",id:2524},"joe.m.manto@wmich.edu"),
    "helpdesk");*/

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/client'));
});

app.post('/auth', (req, res) => {
    console.log("Attempting to auth user " + req.body.user);
    let user = req.body.user, pass = req.body.pass;
    let foundMatchForUser = false;
    db.query("SELECT * FROM users", (err, result) => {
        if (err) {
            res.send({res: "auth-failed"});
        } else {
            for (let i = 0; i < result.length; i++) {
                if (result[i]["empybnid"] === user) {
                    foundMatchForUser = true;
                    if (result[i]['password'] === pass) {
                        let key = apiService.createKeyForUser(user, 60);
                        res.send({res: "auth-success", error: "no-error", key: key});
                        return;
                    }
                }
            }
        }
        if (foundMatchForUser) {
            ldapWrapper.authUser(options, user, pass)
                .then((_) => {
                    let key = apiService.createKeyForUser(user, 60);
                    res.send({res: "auth-success", error: "no-error", key: key});
                })
                .catch((error) => {
                    res.send(error)
                });
        } else {
            res.send({res: "auth-failed", error: "User Not-Found"});
        }
    });
});

app.post('/getUsers',(req,res)=>{
    let sqlUserLookUp = "select empyname,surname,empybnid from users";
    if (apiService.validHashedKeyForUser(req.body.user, req.body.key)) {
        db.query(sqlUserLookUp, (err, result) => {
            if(err || result.length === 0){
                res.send({res: "user-error",error:"Couldn't search for user"});
                return;
            }
            res.send({res:result});
        });
    }else{
        res.send({res: "apiKey-error"});
    }
});

app.post('/addUser',(req,res)=>{
    if (apiService.validHashedKeyForUser(req.body.user, req.body.key)) {

        let getInputMappingIndex = (key) => {
            for(let i = 0;i<req.body.keys.length;i++){
                if(key === req.body.keys[i]){
                    return req.body.inputs[i];
                }
            }
        };

        let sqlUserLookUp = "select * from users where empybnid = ?";
        sqlUserLookUp = mysql.format(sqlUserLookUp, [getInputMappingIndex("bnid")]);
        db.query(sqlUserLookUp, (err, result) => {
            if (err) {
                res.send({res: "user-error",error:"Couldn't search for user"});
                return;
            }
            if(result.length !== 0){
                res.send({res:"user-already-created",error:"user already exists"});
                return;
            }
            let createUser = "insert into users (empyname,empybnid,role,groupRole) values (?,?,?,?)";
            createUser = mysql.format(createUser, [getInputMappingIndex("fstName"),getInputMappingIndex("bnid"),0,0]);
            db.query(createUser, (err, result) => {
                if (err) {
                    res.send({res: "user-error",error:"Couldn't search for user"});
                    return;
                }
                if(result.length !== 0){
                    res.send({res:"success"});
                }
            });
        });
    }else{
        res.send({res: "apiKey-error"});
    }
});

app.post('/postShift', (req, res) => {
    let postUser = req.body.user;
    let shift = req.body.shiftDetails;

    if (apiService.validHashedKeyForUser(postUser, req.body.key)) {
        let sqlUserLook = "select id,groupRole from users where empybnid = ?";
        let sqlAddShift = "Insert into shifts (coveredBy,postedBy,availability,positionID," +
            "groupID,perm,shiftDateStart,shiftDateEnd,message) values (NULL,?,0,?,?,?,?,?,?)";
        let group;

        sqlUserLook = mysql.format(sqlUserLook, [postUser]);
        db.query(sqlUserLook, (err, result) => {
            if (err) {
                res.send({res: "shiftpost-error"});
                return;
            }
            postUser = result[0]['id'];
            group = result[0]['groupRole'];
            if (shift.selectedPosition === null) shift.selectedPosition = 1;

            sqlAddShift = mysql.format(sqlAddShift, [postUser,
                parseInt(shift.selectedPosition),
                group,
                shift.permShiftPosting === "off" ? 0 : 1,
                shift.date,
                shift.endDate,
                shift.message]);

            db.query(sqlAddShift, (err, result) => {
                if (err) {
                    console.log(err);
                    res.send({res: "shiftpost-error"});
                } else {
                    db.query("select shiftDateEnd,shiftID from shifts where shiftID = (Select MAX(shiftID) from shifts)",(err,result)=>{
                       if(err){
                           console.log(err);
                       }
                       let message = result[0]['shiftID']+" "+result[0]['shiftDateEnd'];
                       shiftServiceChild.send('ADD '+message);
                    });
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

    if (apiService.validHashedKeyForUser(pickUpUser, req.body.key)) {
        let sqlCheckShift = "Select * from shifts where shiftId = ? AND availability = 0";
        sqlCheckShift = mysql.format(sqlCheckShift, [shiftId]);
        db.query(sqlCheckShift, (err, result) => {
            if (err) {
                res.send({res: "shift-error"});
                return;
            }
            if (result.length === 0) {
                res.send({res: "shift-error"});
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
                    res.send({res: "success"})
                })
            })
        })
    } else {
        res.send({res: "apiKey-error"});
    }
});

app.post('/deleteShift', (req, res) => {
    if (apiService.validHashedKeyForUser(req.body.user, req.body.key)) {
        let shiftId = req.body.shiftId;
        let sqlShiftRemove = "Delete from shifts where shiftId = ?";
        sqlShiftRemove = mysql.format(sqlShiftRemove, [shiftId]);
        db.query(sqlShiftRemove, (err, result) => {
            if (err) {
                res.send({res: "shift-error"});
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

    if (apiService.validHashedKeyForUser(req.body.user, req.body.key)) {
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
                " groupId = ? AND t1.postedBy = t2.id AND availability = ? ORDER BY shiftDateStart ASC;";

            sqlShifts = mysql.format(sqlShifts, [groupRole, covered]);
            db.query(sqlShifts, (err, result) => {
                if (err) {
                    res.send({res: "User-Missing"});
                }
                res.send({res: result})
            });
        });
    } else {
        res.send({res: "apiKey-error"});
    }
});

app.post('/getPositions', (req, res) => {
    if (apiService.validHashedKeyForUser(req.body.user, req.body.key)) {
        let user = req.body.user;
        let roleChecksql = "Select role,groupRole from users where empybnid = ?";
        roleChecksql = mysql.format(roleChecksql, [user]);
        db.query(roleChecksql, (err, result) => {
            if (err) {
                res.send({res: "User-Missing"});
                return;
            }
            let userInfo = {user: user, role: result[0]['role'], groupId: result[0]['groupRole']};
            if (userInfo.role === 1 || userInfo.role === 2) {
                res.send({res: []});
                return;
            }
            console.log(userInfo.groupId);
            let positionsSql = "Select id,posName from positions where groupId = ?";
            positionsSql = mysql.format(positionsSql, [userInfo.groupId]);
            db.query(positionsSql, (err, result) => {
                if (err) {
                    res.send({"res": "User-Missing"});
                }
                res.send({res: result});
            });
        });
    } else {
        res.send({res: "apiKey-error"});
    }
});

app.post('/rec', (req, res) => {
    if (apiService.validHashedKeyForUser(req.body.cookieUser, req.body.key)) {
        if (req.body.user) {
            let sql = "Select cosID,empyID,date,name,win,bnid,empybnid,empyname from records" +
                " t1,customer t2,users t3 where (t1.cosID = t2.id && t1.empyID = t3.id && date = ? && empybnid = ?);";
            sql = mysql.format(sql, [req.body.date, req.body.user]);
            db.query(sql, (err, result) => {
                if (err) {
                    console.log(err);
                    res.send({res: "date-invalid"});
                    return;
                }
                res.send({res: result});
            });
        } else {
            let sql = "Select cosID,empyID,date,name,win,bnid,empybnid,empyname from records" +
                " t1,customer t2,users t3 where (t1.cosID = t2.id && t1.empyID = t3.id && date = ?);";
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

app.listen('5000', () => {
    console.log('Server started on port 5000');
});
