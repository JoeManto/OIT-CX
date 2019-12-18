
class User {
    /**
     * @param {String} bind  the ldap and database id of the user 'jfj5666'
     * @param {String} type customer or employee user 
     */
    constructor(bind,type){
        this.bind = bind;
        this.type = type;
    }

    isCustomer(){return this.type === "customer"};
    isEmployee(){return this.type === "employee"}; 
}

module.exports = User;