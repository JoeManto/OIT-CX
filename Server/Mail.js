const nodemailer = require("nodemailer");
const mysql = require("mysql");
const config = require("./SecretConfig");

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
    }

    async sendMail(shiftData,UserData,groupID){
        let gatherMailData = new Promise(function (resolve, reject) {
            db.query(mysql.format("select emailList from groupRoles where groupID = ?"), [groupID], (err, result) => {
                if (err) {
                    reject({error:"couldn't fetch email lists"});
                    return;
                }
                let target = result[0]['emailList'];
                let mailData = {
                    from: '"Joseph Manto" <joe.m.manto@wmich.edu>',
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
                await this.adminTransporter.sendMail(result.res,()=>console.log("mail sent"));
                console.log("mail sending is disabled");
            })
            .catch(error=>console.log(error));
    }
}

module.exports = Mail;