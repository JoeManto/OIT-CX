const mysql = require('mysql');
const db = require('../wrappers/MysqlWrapper');
require('dotenv').config();
const config = require('../SecertConfig');

class EnvVarManager {
    constructor(){
        this.db = mysql.createConnection(config.db_config());
        this.db.connect((err) => {
            if (err) {
                throw err;
            }
            console.log('mysql connected...');
        });
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

    async applyEnvironmentOverrides(){
        db.query('select * from env', (err, overrides) => {
            if (err) {
                console.log('sql err gathering env variables');
                return;
            }
            
            for(let i = 0; i < overrides.length; i++){
                let {varName,varType,varValue} = overrides[i];
                process.env[varName] = varType === 'int' ? Number(varValue) : varValue;
                console.log('...applied override for variable'+varName + 'with value '+ varValue);
            }
        });
    }

    async addEnvironmentOverride({varName,varType,varValue}){
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