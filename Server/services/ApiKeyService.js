let sha = require("sha256");
let sleep = require("../../Util/Util.js").sleep;

class ApiKeyService {
    /**
     * @param {[object]} options {startAutomaticCheck | starts a never ending search expired users}
     */
    constructor(options = {startAutomaticCheck:true}) {
        this.openKeys = [];
        //start the constant check of api keys
        if(options.startAutomaticCheck) this.startSearch();
    }

    /**
     *
     * @param user The user is the bnid is the id of the user that went through the auth
     * The user id is used as the owner for the key. Both the owner and the hashed key need to be correct upon
     * key validation.
     * @param admin if the user is admin account
     * @param timeLength is the length the key is going to be valid for. Time length is in seconds
     * @returns {Array} the hash key to be sent to the client for local storage.
     */
    createKeyForUser(user,admin,timeLength) {
        let actual = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
        const endTime = timeLength + Math.floor(new Date().getTime()/1000.0);
        let key = {
            hash: sha(actual),
            endTimeStamp: endTime,
            owner: user,
            admin:admin,
        };
        console.log(key);
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
     * @param adminNeeded if validation is for an admin account
     * @returns {boolean} validation status
     */
    validHashedKeyForUser(user, hash,adminNeeded = false) {
        for (let i = 0; i < this.openKeys.length; i++) {
            if (this.openKeys[i].owner === user) {
                if (this.openKeys[i].hash === hash) {
                    console.log("key found for user " + user);
                    if(adminNeeded){
                        if(this.openKeys[i].admin)
                            return true;
                    }else{
                        return true;
                    }
                    return false;
                }
            }
        }
        return false;
    }

    /**
     * Finds the key obj a given user and expires the key
     * @param user user
     */
    expireOpenKeyForUser(user) {
        for (let i = 0; i < this.openKeys.length; i++) {
            if (this.openKeys[i].owner === user) {
                console.log(new Date().toTimeString());
                console.log("key expired for user " + this.openKeys[i].owner);
                this.openKeys[i] = null;
                this.openKeys = this.openKeys.filter(key => key !== null);
            }
        }
    }

    /**
     * determines if a given key's time is out and if so that key is expired
     * @param  {[type]}  key [openKeys]
     * @return {Boolean}     [description]
     */
    isKeyExpired(key){
      if(!key)
        return;
      let nowMS = Math.floor(new Date().getTime()/1000.0);
      if(key.endTimeStamp <= nowMS){
        this.expireOpenKeyForUser(key.owner);
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
            await sleep(20000);
            //if(this.openKeys.length === 0)
            //continue;
            console.log(this.openKeys.length);
            console.log("checking for expired users");

            /*let nowMS = Math.floor(new Date().getTime()/1000.0);
            if (this.openKeys[i] && this.openKeys[i].endTimeStamp <= nowMS) {
                this.expireOpenKeyForUser(this.openKeys[i].owner);
            }*/
            this.isKeyExpired(this.openKeys[i]);

            i++;

            if (i === this.openKeys.length) i = 0;
        }
    }

    //-----------------------------test functions-------------------------------
    apiKeyInsertionTest(input,output){
      let key = {
        owner:input[0],
        admin:input[1],
        endTimeStamp:input[2],
      };
      let keys = this.openKeys;
      for(let i = 0;i<this.openKeys.length;i++){
        if(keys[i].owner === key.owner){
          return true;
        }
      }
      return false;
    }

    apiKeyExpireTest(input,output){
      let owner = input[0];
      for(let i = 0;i<this.openKeys.length;i++){
        if(this.openKeys[i].owner === owner){
          return false;
        }
      }
      return true;
    }

}

module.exports = ApiKeyService;
