import {getCookie} from "./Authentication";
import {IP} from "./Util";

const BASIC_HEADER = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

async function apiResponse(method,header,body,endPoint) {
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

export function recordFetch(date = Date.now(), user = getCookie("user-bnid")) {
    return apiResponse(
        'POST',
          BASIC_HEADER,
            {
                    date: date,
                    user: user,
                    cookieUser: getCookie("user-bnid"),
                    key: getCookie("key"),
                },
        '/rec')
}

export function shiftFetch(user = getCookie("user-bnid"), covered) {
    return apiResponse(
        'POST',
                BASIC_HEADER,
        {
            user: user,
            covered: covered,
            key: getCookie("key"),
        },
        '/getShifts',
    );
    /*

    return (async () => {
        const rawResponse = await fetch('/getShifts', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: user,
                covered: covered,
                key: getCookie("key"),
            })
        });
        if (rawResponse.status !== 200)
            return false;
        const content = await rawResponse.json();
        if (content.res === "apiKey-error") {
            window.location = IP();
        }
        return (content);
    })();*/
}

export function logout() {
    return (async () => {
        const rawResponse = await fetch('/unAuth', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: getCookie("user-bnid"),
                key: getCookie("key"),
            })
        });
        if (rawResponse.status !== 200)
            return false;
        const content = await rawResponse.json();
        if (content.res === "apiKey-error") {
            console.log("apikey-error");
            //window.location = IP();
        }
        return (content);
    })();
}

export function getPositionsForUser(fetchAll = false) {
    return (async () => {
        const rawResponse = await fetch('/getPositions', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: getCookie("user-bnid"),
                key: getCookie("key"),
                fetchAll:fetchAll,
            })
        });
        if (rawResponse.status !== 200)
            return false;
        const content = await rawResponse.json();
        if (content.res === "apiKey-error") {
            window.location = IP();
        }
        return (content);
    })();
}

export function pickUpShift(user = getCookie("user-bnid"), shiftId) {
    return (async () => {
        const rawResponse = await fetch('/pickUpShift', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: user,
                shiftId: shiftId,
                key: getCookie("key"),
            })
        });
        if (rawResponse.status !== 200)
            return false;
        const content = await rawResponse.json();
        if (content.res === "apiKey-error") {
            window.location = IP();
        }
        return (content);
    })();
}

export function deleteShift(user = getCookie("user-bnid"), shiftID) {
    return (async () => {
        const rawResponse = await fetch('/deleteShift', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: user,
                shiftId: shiftID,
                key: getCookie("key"),
            })
        });
        if (rawResponse.status !== 200)
            return false;
        const content = await rawResponse.json();
        if (content.res === "apiKey-error") {
            window.location = IP();
        }
        if (content.res === "success") {
            return content;
        } else {
            return false;
        }
    })();
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

export function postShift(user = getCookie("user-bnid"), shiftDetails) {
    shiftDetails.endDate = shiftDetails.endDate.getTime();
    shiftDetails.date = shiftDetails.date.getTime();

    const rawResponse = fetch('/postShift', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user: user,
            shiftDetails: shiftDetails,
            key: getCookie("key"),
        })
    });
    if (rawResponse.status !== 200)
        return false;
    const content = rawResponse.json();
    if (content.res === "apiKey-error") {
        window.location = IP();
    }
    return (content);
}

export function getUsers() {
    return (async () => {
        const rawResponse = await fetch('/getUsers', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: getCookie("user-bnid"),
                key: getCookie("key"),
            })
        });
        if (rawResponse.status !== 200)
            return [];
        const content = await rawResponse.json();
        if (content.res === "apiKey-error") {
            window.location = IP();
        }
        return (content);
    })();
}
