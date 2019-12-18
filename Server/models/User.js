const db = require('../wrappers/MysqlWrapper');

class User {
    /**
     * @param {String} bnid  the ldap and database id of the user 'jfj5666'
     * @param {String} type customer or employee user 
     */
    constructor(bnid,type){
        this.bnid = bnid;
        this.type = type;
    }

    lookup() {
        if(!this.type)
            return Promise.reject({error:"user type not specified"});

        if(this.isCustomer()) return db.query("select * from customer where bnid = ?",{conditions:[this.bnid]});
    
        if(this.isEmployee()) return db.query("select * from users where bnid = ?",{conditions:[this.bnid]});
    }

    isCustomer(){return this.type === "customer"};
    isEmployee(){return this.type === "employee"}; 
}

module.exports = User;