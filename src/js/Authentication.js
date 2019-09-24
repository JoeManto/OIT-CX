import {IP} from '../js/Util.js';
/**
 * @return {boolean}
 */
export function Auth(cred) {
    cred.user = cred.user.toLowerCase();
    return (async () => {
        const rawResponse = await fetch('/auth', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: cred.user.toLowerCase(),
                pass: cred.pass,})
        });
        const content = await rawResponse.json();
        console.log(content.res);
        if(content.res === "auth-success"){
            setCookie("user-bnid",cred.user,1);
            setCookie("key",content.key,1);
            return {status:true,error:"no-error"};
        }
        if(content.error){
            console.log(content.error);
        }
        return {status:false,error:content.error};
    })();
}

export function validateCookie(){
    const cookie = getCookie("user-bnid");
    const landing =  IP()+'/';

    console.log(window.location.href);
    if(window.location.href === landing){
        if(cookie && cookie !== "null"){
            return {route:IP()+"/shifts"};
        }
    }else if(window.location.href !== landing){
        if(!cookie || cookie === "null"){
            return {route:landing};
        }
    }
    return null;
}
export function setCookie(cname, cvalue, exdays) {
    let d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
export function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
