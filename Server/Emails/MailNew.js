const nodemailer = require("nodemailer");
const handlebars = require('handlebars');
const fs = require('fs');
const db = require('../wrappers/MysqlWrapper');
const config = require('../SecertConfig.js');
const Employee = require('../models/Employee');

/*
    *sendCoveredShift
    builds an email for both the parties
    takes in covering user info and posters info
    and shift info

    *sendShiftPosting
    takes in posting user info
    takes in shift posted info

    needs the find the group that the user is a part of 
    and set that as the sendTo address.

    *Send Mail Function
     takes in a pre-built html message
     just used to send out the message
*/

class Mail {

    constructor(){
        this.adminTransporter = nodemailer.createTransport(config.transporter_config());
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

    async sendCoveredShift(shift){
		
		let coveredByEmployee = new Employee();
		let coveredByData = await shift.shiftData.coveredBy;
		await coveredByEmployee.apply(coveredByData[0].empybnid);
		

		let postedByEmployee = new Employee();
		let postedByData = await shift.shiftData.postedBy;
		await postedByEmployee.apply(postedByData[0].empybnid);

        //first email | email to the employee who picked up the shift
		let replacements1 = {
			_FirstName: coveredByEmployee.data.empyname,
			_FullName:  postedByEmployee.data.empyname + ' ' + postedByEmployee.data.surname,
			_ShiftType: shift.shiftData.posName,
			_ShiftDate: this.formatLocaleDate(shift.shiftData.shiftDateStart),
			_ShiftStartTime: this.formatLocaleTime(shift.shiftData.shiftDateStart),
			_ShiftEndTime: this.formatLocaleTime(shift.shiftData.shiftDateEnd),
			_Message: shift.shiftData.message,
			_PostingDate: this.formatLocaleDate(),
			_CoveredDefaultMessage: 'This is a confirmation email for the shift that you picked up. (see shift details below)',
            _Permanent: shift.shiftData.perm === 0 ? "No" : "Yes",
        };
		
		//second email | email to the employee that posted the shift

		let replacements2 = {
			_FirstName: postedByEmployee.data.empyname,
			_FullName:  postedByEmployee.data.empyname + ' ' + postedByEmployee.data.surname,
			_ShiftType: shift.shiftData.posName,
			_ShiftDate: this.formatLocaleDate(shift.shiftData.shiftDateStart),
			_ShiftStartTime: this.formatLocaleTime(shift.shiftData.shiftDateStart),
			_ShiftEndTime: this.formatLocaleTime(shift.shiftData.shiftDateEnd),
			_Message: shift.shiftData.message,
			_PostingDate: this.formatLocaleDate(),
			_CoveredDefaultMessage: 'Your shift was picked up by ' + coveredByEmployee.data.empyname + '!',
            _Permanent: shift.shiftData.perm === 0 ? "No" : "Yes",
        };


		let mailOptions1 = {
            from: '"oit-shifts" <oit_shifts@wmich.edu>',
            to : await coveredByEmployee.getEmail(),
            subject : 'Shift Posting',
        }


		console.log("sending mail to :"+ mailOptions1.to+":");
		
		this.send(this.adminTransporter,mailOptions1,'/shiftcovering.html',replacements1);

		let extraTransporter = nodemailer.createTransport(config.transporter_config());


		let mailOptions2 = {
            from: '"oit-shifts" <oit_shifts@wmich.edu>',
            to : await postedByEmployee.getEmail(),
            subject : 'Shift Posting',
        }
		
		mailOptions2.to = await postedByEmployee.getEmail();

		console.log("sending mail to :"+ mailOptions2.to+":");

        this.send(extraTransporter,mailOptions2,'/shiftcovering.html',replacements2);
    
    }

/*
       shiftData: {
            shiftID: 276,
            coveredBy: null,
            postedBy:
                    [
                    RowDataPacket {
                        id: 3,
                        empyname: 'admin',
                        surname: 'adminsurname',
                        password: '123456',
                        role: 1,
                        empybnid: 'jfj5666',
                        email: 'joe.m.manto@wmich.edu',
                        groupRole: 0
                    }
                    ],
            postedDate: 2020-02-15T00:27:35.000Z,
            availability: 0,
            positionID: 1,
            groupID: 0,
            perm: 0,
            message: '',
            shiftDateEnd: 2020-02-15T02:00:27.208Z,
            shiftDateStart: 2020-02-15T00:00:27.208Z
        }
 */
    async sendShiftPosting(shift){
    
        let postedBy = await shift.shiftData.postedBy;

        let group = await db.query('select * from groupRoles where groupID = ?',{conditions:[postedBy[0].groupRole]});
        let emailList = group[0].emailList;

        console.log('EMAIL LIST = '+emailList);

        //remove this
        emailList = 'joe.m.manto@wmich.edu'

        //Build Replacements
        let replacements = {
                _FullName:  postedBy[0].empyname + ' ' + postedBy[0].surname,
                _ShiftType: shift.shiftData.posName,
                _Permanent: shift.shiftData.perm === 0 ? "No" : "Yes",
                _ShiftDate: this.formatLocaleDate(shift.shiftData.shiftDateStart),
                _ShiftStartTime: this.formatLocaleTime(shift.shiftData.shiftDateStart),
                _ShiftEndTime: this.formatLocaleTime(shift.shiftData.shiftDateEnd),
                _Message: shift.shiftData.message,
                _PostingDate: this.formatLocaleDate(),
        };

        let mailOptions = {
            from: '"oit-shifts" <oit_shifts@wmich.edu>',
            to : emailList,
            subject : 'Shift Posting',
        }

        //this.send(this.adminTransporter,mailOptions,'/shiftposting.html',replacements);
    }


    /**
     * 
     * @param {NodeMailer Transport Object} transport 
     * @param {Object} mailOptions to, subject, from, html
     */
    send(transport,mailOptions,htmlPath,replacements){

        //remove all before release
		//mailOptions.to = 'joe.m.manto@wmich.edu';

		if(mailOptions.to === 'joe.m.manto@wmich.edu' || mailOptions.to === 'jared.e.teller@wmich.edu'){

			this.readHTMLFile(__dirname + htmlPath, function(err, html) {
				var template = handlebars.compile(html);
				var htmlToSend = template(replacements);

				Object.assign(mailOptions,{html:htmlToSend});

				transport.sendMail(mailOptions, function (error, res) {
					if (error) {
						console.log(error);
						return;
					}
					console.log('mailed!');
				});
			});
		}
    }


    /**
     * Formats the locale JS date to include the day the of the week
     * @param {Date} date 
     */
    formatLocaleDate(date = new Date()){
        const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
        ];
        let dateList = date.toLocaleDateString().split('/');
        return  monthNames[date.getMonth()] +' '+ dateList[1] +', '+dateList[2];
    }

    /**
     * Formats the locale JS time to remove the seconds
     * @param {Date} date 
     */
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
    
}

module.exports = Mail;