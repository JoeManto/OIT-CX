let sha = require("sha256");

class ApiKeyService {
    constructor() {
        this.openKeys = [];
        //start the constant check of api keys
        this.startSearch();
    }

    /**
     *
     * @param user The user is the bnid is the id of the user that went through the auth
     * The user id is used as the owner for the key. Both the owner and the hashed key need to be correct upon
     * key validation.
     * @param timeLength is the length the key is going to be valid for. Time length is in seconds
     * @returns {Array} the hash key to be sent to the client for local storage.
     */
    createKeyForUser(user, timeLength) {
        let actual = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
        const endTime = timeLength + Math.floor(new Date().getTime()/1000.0);
        let key = {
            hash: sha(actual),
            endTimeStamp: endTime,
            owner: user,
        };
        for (let i = 0; i < this.openKeys.length; i++) {
            if (this.openKeys[i].owner === user) {
                this.openKeys[i] = key;
                console.log("key renewed for user " + user);
                return key.hash;
            }
        }
        this.openKeys.push(key);
        console.log("key created for user " + user);
        return key.hash;
    }

    /**
     * Given a key and user from an api call this function determines if the
     * owner and key match any of the open keys
     * @param user user requesting data
     * @param hash local cookie key
     * @returns {boolean} validation status
     */
    validHashedKeyForUser(user, hash) {
        for (let i = 0; i < this.openKeys.length; i++) {
            if (this.openKeys[i].owner === user) {
                if (this.openKeys[i].hash === hash) {
                    console.log("key found for user " + user);
                    return true;
                }
            }
        }
        return false
    }

    /**
     * Finds the key obj a given user and expires the key
     * @param user user
     */
    expireOpenKeyForUser(user) {
        for (let i = 0; i < this.openKeys.length; i++) {
            if (this.openKeys[i].owner === user) {
                console.log("key expired for user " + this.openKeys[i].owner);
                this.openKeys[i] = null;
                this.openKeys = this.openKeys.filter(key => key !== null);
            }
        }
    }

    /**
     * A never ending search for expired key
     * The waits the exc thread every 20 seconds between each check.
     * @returns {Promise<void>}
     */
    async startSearch() {
        let i = 0;
        while (1) {
            const delay = ms => new Promise(res => setTimeout(res, ms));
            await delay(20000);
            console.log("checked for expired users");

            let nowMS = Math.floor(new Date().getTime()/1000.0);
            if (this.openKeys[i] && this.openKeys[i].endTimeStamp <= nowMS) {
                this.expireOpenKeyForUser(this.openKeys[i].owner);
            }
            if (i === this.openKeys.length - 1) {
                i = 0;
            } else {
                i += 1;
            }
        }
    }
}

module.exports = ApiKeyService;