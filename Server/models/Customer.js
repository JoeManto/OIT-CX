const db = require('../wrappers/MysqlWrapper');
const ldapSearchClient = require('../services/LdapSearch');
const User = require('./User');

/**
 * Customer class is an interface for pulling customer data;
 */
class Customer extends User {
    constructor(){
        super(undefined,'customer');
        this.win;
        this.uid;
        this.win;
    }

    getData(){
        return {
            name:this.name,
            uid:this.uid,
            win:this.win,
        }
    }

    /**
     * Todo: Unit Tests
     * !todo: Added support for searching from win
     *
     * Searches cache for a returning customer and ldap for a new customer.
     * Users are cached in the database if found and new.
     *
     * @Success Customer data is set and the customer data is returned
     * @Failure Respect Error is returned
     *
     * @param {String} bnid
     */
    async apply(bnid){
        super.bnid = bnid;

        let cache = await super.lookup()
        .catch(err => err);

        if(cache instanceof Error){
            const data = await this.create(bnid)
            .catch(err => err);

            if(data instanceof Error){
                return Promise.reject(data);
            }

        }else{
            return cache;
        }

        cache = await super.lookup(bnid);

        Object.assign(this,cache[0]);

        return cache;
    }

    /**
     * Todo: Unit Tests
     *
     * LDAP search a bnid and insert and cache that user to the database
     *
     * @Success @returns {Promise} customer data
     * @Failure @returns {Promise} customer.error
     * @Error customer.error is set on ldap user not found or sql insert error
     *
     * @param {String} bnid
     */
     async create(bnid){

        //check to see if the user is already in the db
        let customer = await super.lookup(bnid)
        .catch(err => err);

        //customer already exists in the db
        if(!customer instanceof Error){
            return customer;
        }

        let searchResult = await ldapSearchClient.search(bnid);

        if(searchResult instanceof Error)
          return Promise.reject(searchResult);

        if(searchResult.length === 0)
          return Promise.reject(new Error('Couldnt Search For User : searchResult length was 0'));

          let data = {
              name:searchResult.data[0].wmuFullName,
              bnid:searchResult.data[0].uid,
              win:searchResult.data[0].wmuBannerID,
          }

        let insertSql = "Insert into customer (name,bnid,win) values (?,?,?)";
        return await db.query(insertSql,{conditions:[data.name, data.bnid, data.win]});

        /*
        return ldapSearchClient.search(bnid)
        .then(async searchResult => {
            console.log(bnid);
            if(searchResult.data.length === 0)
                return Promise.reject({error:"Couldn't Search For User ${bnid} | result length was 0"});

            let data = {
                name:searchResult.data[0].wmuFullName,
                bnid:searchResult.data[0].uid,
                win:searchResult.data[0].wmuBannerID,
            }

            let insertSql = "Insert into customer (name,bnid,win) values (?,?,?)";
            return await db.query(insertSql,{conditions:[data.name, data.bnid, data.win]})
            .then(() => data)
            .catch(() => {
                return {error:"Couldn't cache ${bnid} search"};
            });
        })
        .catch(err => {return {error:err}});
        */
    }
}

module.exports = Customer;
