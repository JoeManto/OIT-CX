const mysql = require("mysql");
const config = require('./SecertConfig.js');

class DbHandler {
    constructor(){
        this.db = mysql.createConnection(config.db_config());

        this.db.connect((err) => {
            if(err)
                throw err;
            
            console.log('mysql connected....');
        });
    }

    query(sql,options = {}){
        sql = mysql.format(sql,options.conditions);
        
        return new Promise((resolve,reject) => {
            this.db.query(sql,(err,res) => {
                if(err){
                    reject("Database Query Error");
                }
                resolve(res);
            });
        });
    }
}

let dbhandler = new DbHandler();

module.exports = dbhandler
