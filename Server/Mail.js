const nodemailer = require("nodemailer");
const handlebars = require('handlebars');
const mysql = require("mysql");
const fs = require('fs');
const config = require('./SecertConfig.js');

//DataBase Connection Config
const db = mysql.createConnection(config.db_config());

//Test DataBase Connection
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('mysql connected...');
});

class Mail {
    constructor(){
        this.adminTransporter = nodemailer.createTransport(config.transporter_config());

        //this.sendMail(this.adminTransporter);
    }

    readHTMLFile(path, callback){
        fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
            if (err) {
                throw err;
                callback(err);
            }
            else {
                callback(null, html);
            }
        });
    };

    formatLocaleDate(date = new Date()){
        const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
        ];
        let dateList = date.toLocaleDateString().split('/');
        return  monthNames[date.getMonth()] +' '+ dateList[1] +', '+dateList[2];
    }

    formatLocaleTime(date = new Date()){
        let localTime = {lct:date.toLocaleTimeString(),left:"",right:""};

        if(localTime.lct[5] === ':'){
            localTime.left = localTime.lct.slice(0,5);
        }else{
            localTime.left = localTime.lct.slice(0,4);
        }

        localTime.right = localTime.lct.slice(localTime.left.length+3,localTime.lct.length)
        return localTime.left + localTime.right;
    }

    /*
        Replacements
        _FullName Joe Manto
        _ShiftType Mobile
        _ShiftDate Nov 13, 2019
        _ShiftStartTime 5:00 PM
        _ShiftEndTime 10:00 PM
        _Message
        _PostingDate       Nov 10th, 2019 5:49 PM
    */
    sendShiftPosting(shiftData,userData,groupID){
        
        let startDate = new Date(shiftData.date);
        let endDate = new Date(shiftData.endDate);

        console.log(shiftData);

        //Build Replacements
        let replacements = {
            _FullName: userData.empyname + ' ' + userData.surname,
            _ShiftType: shiftData.positionData[Number(shiftData.selectedPosition)-1]['posName'],
            _ShiftDate: this.formatLocaleDate(startDate),
            _ShiftStartTime: this.formatLocaleTime(startDate),
            _ShiftEndTime: this.formatLocaleTime(endDate),
            _Message: shiftData.message,
            _PostingDate: this.formatLocaleDate(),
        };

        this.sendMail(this.adminTransporter,groupID,'/Emails/ShiftPosting.html',replacements,"");
    }

    sendMail(transport,groupID,htmlpath,replacements,text){
        this.readHTMLFile(__dirname + htmlpath, function(err, html) {
            if(err){
                console.log(err);
            }
            let sendTo = "";
            db.query(mysql.format("select emailList from groupRoles where groupID = ?"), [groupID], (err, result) => {
                if (err) {
                    reject({error:"couldn't fetch email lists"});
                    return;
                }
                sendTo = result[0]['emailList'];
                var template = handlebars.compile(html);
                var htmlToSend = template(replacements);
                var mailOptions = {
                    from: '"oit-shifts" <oit_shifts@wmich.edu>',
                    to : sendTo,
                    subject : 'Shift Posting',
                    html : htmlToSend
                 };
    
                transport.sendMail(mailOptions, function (error, response) {
                    if (error) {
                        console.log(error);
                    }
                });
            });


        });
    }
}








    /*
    async sendMail(shiftData,UserData,groupID){

      let mail = "The Following shift was posted by " + UserData.surname + ", " + UserData.empyname +
      "\n\nShift Dates:\n" + new Date(shiftData.date).toLocaleString() + "\nto\n " + new Date(shiftData.endDate).toLocaleString() +
      "\n\nType: " + shiftData.selectedPosition +
      "\nStatus: Open" +
      "\nPermanent? " + (shiftData.permShiftPosting === 'off' ? "no" : "yes") + "\nDate Posted: " + new Date().toLocaleString()+
      "\n\n Message:\n"+shiftData.message;

        let gatherMailData = new Promise(function (resolve, reject) {
            db.query(mysql.format("select emailList from groupRoles where groupID = ?"), [groupID], (err, result) => {
                if (err) {
                    reject({error:"couldn't fetch email lists"});
                    return;
                }
                let target = "joe.m.manto@wmich.edu";//result[0]['emailList'];
                let date = new Date(shiftData.date);

                let mailData = {
                    from: '"oit-shifts" <oit_shifts@wmich.edu>',
                    to: target,
                    subject: "OIT Shift Posting",
                    text: "The Following shift was posted by " + UserData.surname + ", " + UserData.empyname +
                    "\n\nShift Dates:\n" + new Date(shiftData.date).toLocaleString() + "\nto\n " + new Date(shiftData.endDate).toLocaleString() +
                    "\n\nType: " + shiftData.selectedPosition +
                    "\nStatus: Open" +
                    "\nPermanent? " + (shiftData.permShiftPosting === 'off' ? "no" : "yes") + "\nDate Posted: " + new Date().toLocaleString()+
                    "\n\n Message:\n"+shiftData.message,
                    html: ""
                };
                resolve({res:mailData})
            });
        });



        gatherMailData
            .then(async (result) => {
                await this.adminTransporter.sendMail(result.res,(err)=>console.log(err));
                //console.log("mail sending is disabled");
            })
            .catch(error=>console.log(error));

    
    }*/


module.exports = Mail;
