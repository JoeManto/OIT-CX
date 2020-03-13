const db = require('../wrappers/MysqlWrapper');
const ldapSearchClient = require('../services/LdapSearch');
const CXError = require('./CXError');
const User = require('./User');

class Employee extends User {
	constructor() {
		super(undefined, 'employee');
	}

	/**
	* Searches the database for a employee.
	*
	* @Success @returns {Promise} Employee data is set and the Employee data is returned
	* @Failure @returns {Promise} Employee.error
	*
	* @param {String} bnid
	*/
	async apply(bnid) {
		//Search for user in the database
		const cache = await super.lookup({ by: "empybnid", value: bnid })
			.catch(err => err);

		//User was not found in the database
		if (cache instanceof Error) return new Error('employee not found');

		this.data = cache[0];
		return cache;
	}

	async create(bnid, group, role) {
		//Search for user in the database
		const cache = await super.lookup({ by: "empybnid", value: bnid })
			.catch(err => err);

		//User was found in the database
		if (!(cache instanceof Error)) {
			return Promise.reject(new CXError('Duplicate User Error', 'that employee already exists in the database', null));
		}

		let result = await ldapSearchClient.search(bnid)
			.catch(err => err);

		if (result.data.length === 0) {
			return Promise.reject(new CXError('LDAP Error', 'Data retrieval failed for the bronco netId ' + bnid));
		}

		let LDAP_Data = {
			email: result.data[0].mail,
			preferredName: result.data[0].eduPersonNickname,
			lastName: result.data[0].wmuLastName,
		}

		return db.query('insert into users (empyname,surname,role,empybnid,email,groupRole) values (?,?,?,?,?,?)', {
			conditions: [
				LDAP_Data.preferredName,
				LDAP_Data.lastName,
				role,
				bnid,
				LDAP_Data.email,
				group,
			]
		})
			.catch(err => Promise.reject(new CXError('SQL Error', 'inserting new user', err)));
	}

	/**
	 * Retrieves the department email group for a given employee
	 * 
	 * @error returns the sql error
	 * @returns the group email address of the selected employee
	 */
	async getEmailGroup() {

		if (!this.data) return;

		let res = await db.query('select * from grouproles where groupID = ?', { conditions: [this.data.groupRole] })
			.catch(err => new Error(err));

		return (res instanceof Error) ? res : res[0].emailList;
	}

	getGroup() {
		if (!this.data) return new CXError('Employee is not selected');

		return this.data.groupRole;
	}

	isLocked() {

		if (!this.data) return new CXError('Employee is not selected');

		return this.data.locked;
	}

	/**
	 * TODO: UNIT TESTS
	 * 
	 * @param {*} locked 
	 */
	async editLock(locked) {

		if (!this.data) return new CXError('Employee is not selected');

		db.query('update users set locked = ? where id = ?', { conditions: [locked, this.data.id] })
			.catch(err => console.log(err));
	}

	/**
	 * @param {object} new_data
	 * 
	 * {
	 *  empyname:
	 *  surname:
	 *  role:
	 *  empybnid:
	 *  email:
	 *  groupRole:
	 * }
	 */

	/*
	+-----------+--------------+------+-----+---------+----------------+
| Field     | Type         | Null | Key | Default | Extra          |
+-----------+--------------+------+-----+---------+----------------+
| id        | int(11)      | NO   | PRI | NULL    | auto_increment |
| empyname  | varchar(255) | YES  |     | NULL    |                |
| surname   | varchar(255) | YES  |     | NULL    |                |
| password  | varchar(255) | YES  |     | NULL    |                |
| role      | int(11)      | YES  |     | NULL    |                |
| empybnid  | varchar(255) | YES  |     | NULL    |                |
| email     | varchar(255) | YES  |     | NULL    |                |
| groupRole | int(11)      | YES  |     | NULL    |                |
| locked    | tinyint(4)   | YES  |     | 0       |                |
+-----------+--------------+------+-----+---------+----------------+ 
	*/
	async edit(new_data) {
		if (!this.data) return new CXError('Employee is not selected');

	}

	/**
	 * returns the users email if the user doesn't have an email recorded in the data base then an ldap request will be made
	 * That request will be record into the data base for next time.
	 * 
	 * @error return the respected error
	 * @returns the email address of the selected employee
	 */
	async getEmail() {

		if (!this.data) return new Error('getEmail error: No Employee Selected');

		let cache = await db.query('select * from users where empybnid = ?', { conditions: [this.data.empybnid] });

		if (cache.length > 0 && cache[0].email !== null) {
			return cache[0].email;
		}

		let result = await ldapSearchClient.search(this.data.empybnid)
			.catch(err => err);

		if (result.data.length === 0) {
			return Promise.reject(new Error('Employee could not be found with the provided bnid'));
		}

		let email = result.data[0].mail;

		db.query('update users set email = ? where empybnid = ?', { conditions: [email, this.data.empybnid] })
			.catch(err => console.log(err));

		return email;
	}

}

module.exports = Employee;


