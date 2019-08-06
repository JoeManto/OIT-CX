import {getCookie} from "./Authentication";
import {IP} from "./Util";

export function recordFetch(date = Date.now(), user = getCookie("user-bnid")) {
    return (async () => {
        const rawResponse = await fetch('/rec', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                date: date,
                user: user,
                cookieUser: getCookie("user-bnid"),
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

export function shiftFetch(user = getCookie("user-bnid"), covered) {
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
    })();
}

export function getPositionsForUser() {
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
        if (rawResponse.status !== 200)
            return this.reject();

        const content = await rawResponse.json();
        if (content.res === "apiKey-error") {
            window.location = IP();
        }
        if (content.res === "success") {
            return content;
        } else {
            this.reject();
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
