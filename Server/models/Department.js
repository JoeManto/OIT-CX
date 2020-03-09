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

}

module.exports = Department;