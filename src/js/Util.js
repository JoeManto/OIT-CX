const dotenv = require('dotenv');
const config = require('../config');
dotenv.config();

export let IP = () => {return config.host_name()};

export let daysOfTheWeek = () => ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

export let formatAMPM = (date) => {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
};

export function sqlTimeStampFormat(){
  let date = new Date();
  let isoDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
  return isoDate.slice(0, 19).replace('T', ' ')
}

export function sqlDateFormat(){
  return sqlTimeStampFormat().substring(0,10);
}

export function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
        end = new Date().getTime();
    }
}
export var getDaysInMonth = function(month,year) {
    return new Date(year, month, 0).getDate();
};

export function checkWindowHeight() {
    let elem = document.getElementById("FooterCont");
    if(!elem)
        return;
    window.onscroll = function () {
        if (document.documentElement.scrollTop + document.documentElement.clientHeight > document.body.offsetHeight) {
            if(elem.style.display !== "")
                elem.style.display = "";
        } else {
            if(elem.style.display !== "none")
                elem.style.display = "none";
        }
    }
}
export function changeTimezone(date, ianatz) {

    var invdate = new Date(date.toLocaleString('en-US', {
      timeZone: ianatz
    }));

    var diff = date.getTime() - invdate.getTime();

    return new Date(date.getTime() + diff);
  }

export const inDifferentTimeZone = () =>{
    return new Date().getHours() != changeTimezone(new Date(),'America/New_York').getHours();
}