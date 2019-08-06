const nodemailer = require("nodemailer");

class Mail {
    constructor(){
        this.helpdeskTransport = nodemailer.createTransport({
            host: "smtp.office365.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: "jfj5666@wmich.edu",
                pass: "",
            },
            tls: {
                minVersion: 'TLSv1.1',
            },
        });
    }

    async sendMail(postData,sender){
        let transporters = [];
        switch (sender) {
            case "helpdesk":
                transporters.push(this.helpdeskTransport);
            case "labs":
                break;
            case "calls":
                break;
            default:
                break;
        }
        for(let i = 0;i<transporters.length;i++){
            await transporters[i].sendMail(postData,()=>{
                console.log("Mail Sent");
            });
        }
    }

    createShiftPosting(postInfo,shiftInfo,to){
        let mailData = {
            from:'"Joseph Manto" <joe.m.manto@wmich.edu>',
            to:to,
            subject: "Test Mail",
            text:"The Following shift was posted by "+postInfo.poster+
                "\n\nShift Dates:\n"+shiftInfo.start.toLocaleString()+"\nto\n "+shiftInfo.end.toLocaleString()+
                "\n\nType: "+shiftInfo.type+
                "\nStatus: Open"+
                "\nDate Posted: "+new Date().toLocaleString()+
                "\n\nShift ID: "+shiftInfo.id,
            html:""
        };
        return mailData;
    }
}

module.exports = Mail;