const express = require('express');
const https = require('https');
const fs = require('fs');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');
const config = require('./SecretConfig');
const ldapWrapper = require('./Ldapwrapper');

const ldapSearch = require('./LdapSearch');
const ApiKeyService = require('./ApiKeyService');
const Mail = require('./Mail');

//----------------------------SETUP----------------------------------


async function pause() {
    const delay = ms => new Promise(res => setTimeout(res, ms));
    await delay(5000);
}

const cp = require('child_process');
const shiftServiceChild = cp.fork('Server/ShiftService.js');

const key = fs.readFileSync(__dirname + '/ssl/selfsigned.key');
const cert = fs.readFileSync(__dirname + '/ssl/selfsigned.crt');
const sslOptions = {
    key: key,
    cert: cert
};

//DataBase Connection Config
const db = mysql.createConnection(config.db_config());

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
let ldapConfig = config.ldap_config();
const ldapSearchClient = new ldapSearch();

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

//----------------------------SERVICES----------------------------------

setInterval(() => {
    shiftServiceChild.send('CHECK');
}, 20000);
/*setInterval(() => {
    shiftServiceChild.send('PRUNE');
}, 200000);*/

shiftServiceChild.on('message', function (m) {
    console.log('[AUTO][SHIFT WORKER] : ' + m);
});

let apiService = new ApiKeyService();

let mailService = new Mail();

//----------------------Helper Functions----------------------------------


//-------------------------ENDPOINTS--------------------------------------

app.get('/', function (req, res) {
    //res.sendFile(path.join(__dirname + '/client'));
    res.send({res:"hello"});
});

app.post('/unAuth',(req,res) => {
   console.log("attempting to remove access for user "+req.body.user);
   if(apiService.validHashedKeyForUser(req.body.user,req.body.key)){
       console.log("removed user");
       apiService.expireOpenKeyForUser(req.body.user);
       res.send({res:"success"});
   }else{
       res.send({res: "apiKey-error"});
   }
});

app.post('/auth', (req, res) => {
    console.log("Attempting to auth user " + req.body.user);
    let user = req.body.user, pass = req.body.pass;
    let foundMatchForUser = false;
    let userRole = 0;
    db.query("SELECT * FROM users", (err, result) => {
        if (err) {
            res.send({res: "auth-failed"});
        } else {
            for (let i = 0; i < result.length; i++) {
                if (result[i]["empybnid"] === user) {
                    foundMatchForUser = true;
                    userRole = result[i]['role'];
                    if (result[i]['password'] === pass) {
                        let key = apiService.createKeyForUser(user, result[i]['role'] === 1,60);
                        res.send({res: "auth-success", error: "no-error", key: key});
                        return;
                    }
                }
            }
        }
        if (foundMatchForUser) {
            ldapWrapper.authUser(options, user, pass)
                .then((_) => {
                    let key = apiService.createKeyForUser(user, userRole === 1,60);
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

app.post('/getUsers', (req, res) => {
    let sqlUserLookUp = "select empyname,surname,empybnid from users";
    if (apiService.validHashedKeyForUser(req.body.user, req.body.key,true)) {
        db.query(sqlUserLookUp, (err, result) => {
            if (err || result.length === 0) {
                res.send({res: "user-error", error: "Couldn't search for user"});
                return;
            }
            res.send({res: result});
        });
    } else {
        res.send({res: "apiKey-error"});
    }
});

app.post('/addUser', (req, res) => {
    if (apiService.validHashedKeyForUser(req.body.user, req.body.key,true)) {
        console.log(req.body.inputs);
        console.log(req.body.keys);
        let getInputMappingIndex = (key) => {
            for (let i = 0; i < req.body.keys.length; i++) {
                if (key === req.body.keys[i]) {
                    return req.body.inputs[i];
                }
            }
        };

        let sqlUserLookUp = "select * from users where empybnid = ?";
        sqlUserLookUp = mysql.format(sqlUserLookUp, [getInputMappingIndex("bnid")]);
        db.query(sqlUserLookUp, (err, result) => {
            if (err) {
                res.send({res: "user-error", error: "Couldn't search for user"});
                return;
            }
            if (result.length !== 0) {
                res.send({res: "user-error", error: "user already exists"});
                return;
            }
            let createUser = "insert into users (empyname,surname,empybnid,role,groupRole) values (?,?,?,?,?)";

            ldapSearchClient.search(getInputMappingIndex("bnid")).then(ldapResult =>{
                if(ldapResult.data.length === 0){
                    res.send({res:"user-error",error:"User couldn't be found in LDAP server"});
                }else{
                    res.send({res: "success"});
                    createUser = mysql.format(createUser,
                        [getInputMappingIndex("fstName"),ldapResult.data[0].sn,
                        getInputMappingIndex("bnid"),getInputMappingIndex('role'), getInputMappingIndex('pos')]);
                        db.query(createUser, (err, result) => {
                        if (err) {
                            res.send({res: "user-error", error: "Couldn't add user"});
                            return;
                        }
                        if (result.length !== 0) {
                            res.send({res: "success"});
                        }
                        });
                }
            });


        });
    } else {
        res.send({res: "apiKey-error"});
    }
});

app.post('/postShift', (req, res) => {
    let postUserID = req.body.user;
    let shift = req.body.shiftDetails;

    if (apiService.validHashedKeyForUser(postUserID, req.body.key)) {
        let sqlUserLook = "select * from users where empybnid = ?";
        let sqlAddShift = "Insert into shifts (coveredBy,postedBy,availability,positionID," +
            "groupID,perm,shiftDateStart,shiftDateEnd,message) values (NULL,?,0,?,?,?,?,?,?)";
        let group;

        sqlUserLook = mysql.format(sqlUserLook, [postUserID]);
        db.query(sqlUserLook, (err, result) => {
            if (err) {
                res.send({res: "shiftpost-error"});
                return;
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
                    console.log(err);
                    res.send({res: "shiftpost-error"});
                } else {
                    db.query("select shiftDateEnd,shiftID from shifts where shiftID = (Select MAX(shiftID) from shifts)", (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                        let message = result[0]['shiftID'] + " " + result[0]['shiftDateEnd'];
                        shiftServiceChild.send('ADD ' + message);
                    });
                    mailService.sendMail(shift,user,group);
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
            if ((userInfo.role === 1 || userInfo.role === 2) && !req.body.fetchAll) {
                res.send({res: []});
                return;
            }
            if(req.body.fetchAll){
                console.log("this this ran");
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

app.post('/locations',(req,res)=>{
  if (apiService.validHashedKeyForUser(req.body.user, req.body.key)) {
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

let server = https.createServer(sslOptions, app);
server.listen(443, () => {
    console.log("server starting on port : " + 443)
});
