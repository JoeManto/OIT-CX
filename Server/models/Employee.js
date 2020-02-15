const db = require('../wrappers/MysqlWrapper');
const ldapSearchClient = require('../services/LdapSearch');
const User = require('./User');

class Employee extends User {
  constructor(){
    super(undefined,'employee');
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
    const cache = await super.lookup({by:"empybnid",value:bnid})
    .catch(err => err);

    //User was not found in the database
    if(cache instanceof Error) return new Error('employee not found');

    this.data = cache[0];
    return cache;
  }

  /**
   * Retrieves the department email group for a given employee
   * 
   * @error returns the sql error
   * @returns the group email address of the selected employee
   */
  async getEmailGroup(){

    if(!this.data) return;

    let res = await db.query('select * from grouproles where groupID = ?',{conditions:[this.data.groupRole]})
    .catch(err => new Error(err));

    return (res instanceof Error) ? res : res[0].emailList;
  }

  /**
   * returns the users email if the user doesn't have an email recorded in the data base then an ldap request will be made
   * That request will be record into the data base for next time.
   * 
   * @error return the respected error
   * @returns the email address of the selected employee
   */
  async getEmail(){

    if(!this.data) return new Error('getEmail error: No Employee Selected');

    let cache = await db.query('select * from users where empybnid = ?',{conditions:[this.data.empybnid]});
    
    if(cache.length > 0 && cache[0].email !== null){
      return cache[0].email;
    }

    let result = await ldapSearchClient.search(this.data.empybnid)
    .catch(err => err);

    if(result.data.length === 0){
      return Promise.reject(new Error('Employee could not be found with the provided bnid'));
    }

    let email = result.data[0].mail;

    db.query('update users set email = ? where empybnid = ?',{conditions:[email,this.data.empybnid]})
    .catch(err => console.log(err));

    return email;
  }

}

module.exports = Employee;


