const db = require('../wrappers/MysqlWrapper');
const ldapSearchClient = require('../services/LdapSearch');
const User = require('./User');

class Employee extends User {
  constructor(){
    super(undefined,'employee');

    this.data;
  }

  /**
  * Searches the database for a employee.
  *
  * @Success @returns {Promise} Employee data is set and the Employee data is returned
  * @Failure @returns {Promise} Employee.error
  *
  * @param {String} bnid
  */
  async apply(bnid){
    //Search for user in the database
    const cache = await super.lookup()
    .catch(err => err);

    //User was not found in the database
    if(cache instanceof Error) return new Error('employee not found');

    this.data = cache;
    return cache;
  }

}

module.exports = Employee;
