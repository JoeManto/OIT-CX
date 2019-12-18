const db = require('../wrappers/MysqlWrapper');
const ldapSearchClient = require('../services/LdapSearch');
const User = require('./User');

/**
 * Customer class is an interface for pulling customer data;
 */
class Customer extends User {
    constructor(bnid = undefined){
        super(bnid,'customer');
        
        if(bnid)
           this.apply(bnid);

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
    apply(bnid){
        super.bnid = bnid;
        
        return super.lookup().then(customerData => {
            if(!customerData > 0) {
                return this.create(bnid);
            }else{
                Object.assign(this,customerData);
            }
        })
        .then(_ => super.lookup(bnid))
        .then(customerData => {
            Object.assign(this,customerData);
            return customerData;
        });

        //console.log(customerData);

        /*let customerData = this.searchCacheForCustomer(bnid);
        console.log(customerData);

        if(!customerData){
            //attempt to new customer
            customerData = this.create(bnid);
            console.log(customerData);

            //an error accrued while inserting the new customer data
            if(!customerData){
                return {error:this.error};
            }

            customerData = super.lookup();
        }

        Object.assign(this,customerData);

        console.log(customerData);

        return customerData;*/

        /*let customerDataCache = this.searchCacheForCustomer(bnid);


        //customer was not found in the database
        if(!customerDataCache){

            //attempt to cache new customer
            customerDataCache = this.create(bnid);

            //an error accrued while inserting the new customer data
            if(!customerDataCache){
                return {error:this.error};
            }

            //recover customer id on top of ldap data
            customerDataCache = this.searchCacheForCustomer(bnid);
        }
        
        //set customer data
        Object.assign(this,customerDataCache);

        return customerDataCache;*/
    }

    /**
     * Todo: Unit Tests
     * 
     * Searches the database for a customer that as already been to OIT
     * 
     * @Success returns customer data
     * @Failure returns false
     *
     * @param {String} bnid 
     */
    async search(bnid){
        //search for customer in database by bnid 
        let cache = await db.query('select * from customer where bnid = ?',{conditions:[bnid]})
        .then(res => {return res})
        .catch();
    
        //valid user cached data was found in the data base
        if(cache && cache.length > 0){
            return cache[0];
        }

        return false;
    }

    /**
     * Todo: Unit Tests
     * 
     * LDAP search a bnid and insert and cache that user to the database
     * returns 
     * 
     * @Success @returns customer data
     * @Failure @returns undefined and sets customer.error 
     * @Error customer.error is set on ldap user not found or sql insert error
     * 
     * @param {String} bnid 
     */
     create(bnid){
        return ldapSearchClient.search(bnid)
        .then(async searchResult => {
            
            if(searchResult.data.length === 0)
                return Promise.reject({error:"Couldn't Search For User ${bnid}"});

            let data = {
                name:searchResult.data[0].wmuFullName,
                bnid:searchResult.data[0].uid,
                win:searchResult.data[0].wmuBannerID,
            }

          

            let insertSql = "Insert into customer (name,bnid,win) values (?,?,?)";
            return await db.query(insertSql,{conditions:[data.name, data.uid, data.win]})
            .then(_ => {return data})
            .catch(_ => {
                return {error:"Couldn't cache ${bnid} search"};
            });
        })
        .catch(_ => {
            return {error:"Couldn't Search For User ${bnid}"};
        });
    }
}

module.exports = Customer;


