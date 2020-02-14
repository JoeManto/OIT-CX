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
     * todo: unit tests
     *
     * @param {Object} by: {String} what database column to look up by. value: {Any} the matching value in the database column
     */
    async lookup({by,value}) {
        if(!by){
            value = this.bnid;
            by = this.isCustomer() ? "bnid" : "empybnid";
        }

        if(!this.type)
            return Promise.reject(new Error('❌User type is not set [required]'));

        let data; 
        if(this.isCustomer()) data = await db.query("select * from customer where "+by+" = ?", { conditions: [value] });
        if(this.isEmployee()) data = await db.query("select * from users where "+by+" = ?", { conditions: [value] });

        if (data.length === 0)
            return Promise.reject(new Error('⚠️ No Records in the database'));

        return Promise.resolve(data);
    }

    delete(){
        if(!this.bnid) return Promise.reject(new Error("User Delete Error: User is not selected"));
        
        if(this.isEmployee())
            db.query('delete from users where empybnid = ?',{conditions:[this.bnid]});
        else
            db.query('delete from customer where bnid = ?',{conditions:[this.bnid]});
    }

    isCustomer(){return this.type === "customer"};
    isEmployee(){return this.type === "employee"};
}

module.exports = User;
