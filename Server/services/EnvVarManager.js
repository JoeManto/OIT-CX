const db = require('../wrappers/MysqlWrapper');
const dotenv = require('dotenv');
dotenv.config();

class EnvVarManager {
    constructor(){

    }

    async getEnvironmentVariable(name){
        let variables = await this.gatherEnvironmentOverrides();

        for(let i = 0;i<variables.length;i++){
            if(name === variables[i].varName){
                let value = variables.varValue;
                if(variables[i].varType === 'int'){
                    value = Int(value);
                }
                return value;
            }
        }

        return process.env[name];
    }

    async gatherEnvironmentOverrides(){
        let envChanges = await db.query('select * from env');

        if(envChanges.length === 0){
            return false;
        }

        return envChanges;
    }

    async overrideVariable({varName,varType,varValue}){
        let res = await db.query('select * from env where varName = ?',{conditions:[varName]});

        if(res.length === 0){
            db.query('insert into env (varName,varType,varValue) values (?,?,?)');
        }else{
            db.query('update env set varType = ? varValue = ? where varName = ?',{conditions:[varType,varValue,varName]});
        }
    }
}

let manager = new EnvVarManager();
module.exports = manager;