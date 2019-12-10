const nodemailer = require("nodemailer");
const handlebars = require('handlebars');
const mysql = require("mysql");
const fs = require('fs');
const config = {
    host: "smtp.office365.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: "jfj5666@wmich.edu",
        pass: "XXXXXXXXXXXXXXX",
    },
    tls: {
        minVersion: 'TLSv1.1',
    },
};

class Mail {
    constructor(){
        this.adminTransporter = nodemailer.createTransport(config);
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

    createHtmlEmail(){
        this.sendMail(this.adminTransporter,0,'/EmailTest.html',{_Text:"Hello World"},"");
    }

    createPlainTextEmail(){
        this.sendMail(this.adminTransporter,0,"",{},"Hello World");
    }

    sendMail(transport,groupID,htmlpath,replacements,tex){
        this.readHTMLFile(__dirname + htmlpath, function(err, html) {
            //Error finding the email template.
            if(err){
                console.log("There was an error finding the file");
                console.err(err);
            }
            
            let sendTo = "joe.m.manto@wmich.edu";

            var template = handlebars.compile(html);
            var htmlToSend = (replacements !== {}) ? template(replacements): undefined;
            var mailOptions = {
                from: '"Joseph Manto" <jfj5666@wmich.edu>',
                to : sendTo,
                subject : 'Shift Posting',
                html : htmlToSend,
                text:tex,
                };
    
                transport.sendMail(mailOptions, function (error, response) {
                    if (error) {
                        console.log(error);
                    }
                });
            
        });
    }
}

