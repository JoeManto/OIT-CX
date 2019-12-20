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

    /**
     * Looks for a user in the db
     * !todo add support for win
     * todo: unit tests
     *
     * @param {String} bnid
     */
    async lookup(bnid) {
        let id = (bnid) ? bnid : this.bnid;

        if(!this.type)
            return Promise.reject(new Error('❌User type is not set * required'));

        let data;
        if(this.isCustomer()) data = await db.query("select * from customer where bnid = ?", { conditions: [id] });

        if(this.isEmployee()) data = await db.query("select * from users where bnid = ?", { conditions: [id] });

        if (data.length === 0)
            return Promise.reject(new Error('⚠️ No Records in the database'));

        return Promise.resolve(data);
    }

    isCustomer(){return this.type === "customer"};
    isEmployee(){return this.type === "employee"};
}

module.exports = User;
