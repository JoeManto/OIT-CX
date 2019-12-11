import {getCookie,setCookie} from "./Authentication";
import {IP} from "./Util";

export const BASIC_HEADER = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

export async function apiResponse(method,header = BASIC_HEADER,body,endPoint) {
      let response = await fetch(endPoint,
        {
              method: method,
              headers: header,
              body: JSON.stringify(body),
        });

        const content = await response.json();

        if (response.status !== 200) {
            return false;
        }
        if (content.res === "apiKey-error") {
            window.location = IP();
        }
        return content;
}

export function recordFetch(date = Date.now(), user = null) {
    return apiResponse('POST', BASIC_HEADER,
        {
            date: date,
            user: user,
            cookieUser: getCookie("user-bnid"),
            key: getCookie("key"),
        }, '/rec')
}

export function shiftFetch(user = getCookie("user-bnid"), covered) {
    return apiResponse('POST', BASIC_HEADER,
        {
            user: user,
            covered: covered,
            key: getCookie("key"),
        }, '/getShifts',
    );
}

export function logout() {
    setCookie("github-repo-data",null,1);
    return apiResponse('POST', BASIC_HEADER,
        {
            user: getCookie("user-bnid"),
            key: getCookie("key"),
        }, '/unAuth',
    );
}

export function getPositionsForUser(fetchAll = false) {
    return apiResponse('POST',BASIC_HEADER,
        {
            user: getCookie("user-bnid"),
            key: getCookie("key"),
            fetchAll:fetchAll,
    },'/getPositions');
}

export function pickUpShift(user = getCookie("user-bnid"), shiftId) {
    return apiResponse('POST', BASIC_HEADER,
        {
            user: user,
            shiftId: shiftId,
            key: getCookie("key"),
        }, 'pickUpShift',
    );
}

export function deleteShift(user = getCookie("user-bnid"), shiftID) {
    return apiResponse('POST', BASIC_HEADER,
        {
            user: user,
            shiftId: shiftID,
            key: getCookie("key"),
        }, '/deleteShift',
    );
}
export function postShift(user = getCookie("user-bnid"), shiftDetails) {
    shiftDetails.endDate = shiftDetails.endDate.getTime();
    shiftDetails.date = shiftDetails.date.getTime();

    return apiResponse('POST',BASIC_HEADER,{
        user: user,
        shiftDetails: shiftDetails,
        key: getCookie("key"),
    },'postShift');
}

export function getUsers() {
    return apiResponse('POST',BASIC_HEADER,{
        user: getCookie("user-bnid"),
        key: getCookie("key"),
    },'getUsers');
}

export function adminOperation(endpoint, keys, inputs) {
    return (async () => {
        const rawResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                keys: keys,
                inputs: inputs,
                user:getCookie("user-bnid"),
                key: getCookie("key"),
            })
        });
        const content = await rawResponse.json();
        if (rawResponse.status !== 200){
            this.reject();
        }
        if (content.res === "apiKey-error") {
            window.location = IP();
        }
        if(content.error){
            this.reject();
            console.log(content.error);
            return content;
        }
        if (content.res === "success") {
            return content;
        }
    })();
}


export function getContributorsList(){
  return new Promise(function (resolve,reject) {
    let githubCont = getCookie("github-contributors");
    if(githubCont != null && githubCont.length !== 0){
        githubCont = githubCont.split(",");
        console.log("hello");
        resolve(githubCont);
        return;
    }
    const request = new XMLHttpRequest();
    request.open('get', 'https://api.github.com/repos/joemanto/oit-cx/contributors', true);
    request.send();
    request.onreadystatechange = function () {
      if(request.readyState === 4){
        if(request.responseText === ""){
          reject({error:"Bad github response: Can't parse"});
          return;
        }
        let out = JSON.parse(request.responseText);
        let urls = [];
        let cookie = ""
        for(let i = 0;i<out.length;i++){
          console.log(out[i].avatar_url);
          urls.push(out[i].avatar_url);
          cookie+=out[i].avatar_url;
          if(i !== out.length-1){
            cookie+=",";
          }
        }
        setCookie('github-contributors',cookie,1);
        resolve(urls);
      }
    }
  });
}

/*
export function getLastCommit() {
    let githubKeys = getCookie("github-repo-keys");
    if(githubKeys != null && githubKeys.length !== 0){
        githubKeys = githubKeys.split(",");
        return new Promise(function (resolve,reject) {
            let commitData = {};
            for(let i = 0;i<githubKeys.length;i++){
                let savedValue = getCookie(githubKeys[i]);
                if(savedValue === null) {
                    reject({error: "cookie error: while fetching cached github commit data please reset your cache"});
                    return;
                }
                commitData[githubKeys[i]] = savedValue;
            }
            resolve(commitData);
        });
    }
    return new Promise(function (resolve, reject) {
        const request = new XMLHttpRequest();
        request.open('get', 'https://api.github.com/repos/joemanto/OIT-CX/commits/master', true);
        request.send();
        request.onreadystatechange = function () {
            if(request.readyState === 4){
                if(request.responseText === ""){
                    reject({error:"Bad github response: Can't parse"});
                    return;
                }

                let out = JSON.parse(request.responseText);
                console.log(out);
                let commitData = {
                    author: out.commit.author.name,
                    date: out.commit.author.date,
                    message: out.commit.message,
                    profileImgUrl: out.committer.avatar_url,
                };

                setCookie("github-repo-keys","author,date,message,profileImgUrl",1);
                setCookie("author",commitData.author,1);
                setCookie("date",commitData.date,1);
                setCookie("message",commitData.message,1);
                setCookie("profileImgUrl",commitData.profileImgUrl,1);
                resolve(commitData);
            }
        };
    });
}*/
