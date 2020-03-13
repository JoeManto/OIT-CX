const db = require('../wrappers/MysqlWrapper');
const CXError = require('./CXError');

class Department {

    constructor(){
        this.data = {
            email:'',
            name:'',
            id:-1,
        }
    }

    async apply({by,value}){

        let result = await db.query('select * from groupRoles where '+by+' = ?',{conditions:[value]})
        .catch(err => new CXError('SQL Error','Applying Department',err));

        if(result.length === 0){
            return Promise.reject(new CXError('Department Not Found'));
        }

        this.data.email = result[0].emailList;
        this.data.name = result[0].groupName;
        this.data.id = result[0].groupID;

        return this.data;
    }

    /**
	 * TODO: TESTING
     * 
     * This function marks the department as locked and updates all users in that department to locked status
     */
    async editLock(locked){
        if(this.data.id === -1) Promise.reject(new CXError('No Department Selected'));

		Promise.all([
			db.query('update groupRoles set locked = ? where groupID = ?',{conditions:[locked,this.data.id]}),
			db.query('update users set locked = ? where groupRole = ?',{conditions:[locked,this.data.id]}),
		]);	
    }

    /**
     * TODO: TESTING
	 * 
     * This function takes new department data and runs an update query on the database.
     * Note new_data can have undefined values which means that field in the database
     * should not be updated
     * @param {object} new_data
     *  {
     *  	emailList:(string)
     *  	groupName:(string)
	 * 		locked:(int) 0 or 1
     *  }
     */

    async edit(new_data){
		if(this.data.id === -1) Promise.reject(new CXError('No Department Selected'));

		if(new_data.email){
            await db.query('update groupRoles set emailList = ? WHERE groupID = ?', {conditions:[new_data.email,this.data.id]})
            .catch(err => new CXError('SQL Error','Updating Email',err));
		}
		
		if(new_data.groupName){
            await db.query('update groupRoles set groupName = ? WHERE groupID = ?', {conditions:[new_data.groupName,this.data.id]})
            .catch(err => new CXError('SQL Error','Updating Group Name',err));
		}

		if(new_data.locked === 1){
			this.editLock(new_data.locked);
		}else if(new_data.locked === 0){
			this.editLock(new_data.locked);
		}
		
		//update local data
		await this.apply({by:'groupID',value:this.data.id});
	}
	
	/**
	 * TODO: TESTING
	 * 
	 * @param {Object} data 
	 * 
	 * {
	 * 		emailList:(string)
	 * 		groupName:(string)
	 * 		locked:(int) 0 or 1
	 * }
	 */
	async add(data){
		return db.query('insert into groupRoles (emailList,groupName,Locked) values (?,?,?)',{conditions:[data.emailList,data.groupName,data.locked]})
		.catch(err => new CXError('SQL Error','Error Inserting New Department',err));
	}

}

module.exports = Department;