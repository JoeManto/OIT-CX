const express = require('express');
const https = require('https');
const fs = require('fs');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');
const config = require('./SecertConfig.js');
const ldapWrapper = require('./wrappers/LdapWrapper');
const newDb = require('./wrappers/MysqlWrapper');
const ldapSearchClient = require('./services/LdapSearch');
const ApiKeyService = require('./services/ApiKeyService');
const Mail = require('./Emails/MailNew');

//models
const Customer = require('./models/Customer');
const Employee = require('./models/Employee');
const Shift = require('./models/Shift');
const Department = require('./models/Department');
const CXError = require('./models/CXError');

//child processes
const cp = require('child_process');
const shiftServiceChild = cp.fork('Server/services/ShiftService.js');
const recordServiceChild = cp.fork('Server/services/RecordService.js');

//ssl
const key = fs.readFileSync(__dirname + '/ssl/selfsigned.key');
const cert = fs.readFileSync(__dirname + '/ssl/selfsigned.crt');
const sslOptions = {
    key: key,
    cert: cert
};

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

setInterval(() => {
    shiftServiceChild.send('CHECK');
}, 20000);
setInterval(() => {
    recordServiceChild.send('CHECK');
}, 20000);

shiftServiceChild.on('message', function (m) {
    console.log('[AUTO][SHIFT WORKER] : ' + m);
});
recordServiceChild.on('message',function (m) {
    console.log('[AUTO][Record WORKER] : ' + m)
});

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
   if(!apiService.validHashedKeyForUser(req.body.user,req.body.key,false))
        return res.send({res: "apiKey-error"});

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

    let userGroup = await newDb.query('select * from users where empybnid = ?',{conditions:[req.body.user]})
    .catch(err => console.log(err));

    if(userGroup[0].groupRole !== department.data.id){
        return res.send({error:"Permission Error",errorMessage:"Inserting users outside of your department isn't allow"});
    }

    //check if user exists
    let employeeToAdd = new Employee();

    employeeToAdd.create(values[0],department.data.id,role)
    .then(res => {
        res.send({res:"User successfully added into the database"});
    })
    .catch(err => res.send({error:err.type,errorMessage:err.description}));
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
                    db.query("select shiftDateEnd,shiftID from shifts where shiftID = (Select MAX(shiftID) from shifts)", async(err, result) => {
                        if (err) {
                            console.log(err);
                        }
                        let message = result[0]['shiftID'] + " " + result[0]['shiftDateEnd'];
                        shiftServiceChild.send('ADD ' + message);

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

let server = https.createServer(sslOptions, app);
server.listen(7304);
