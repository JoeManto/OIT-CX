const mysql = require("mysql");
const config = require('../SecertConfig.js');

class DbHandler {
    constructor(){
        this.build()
    }

    query(sql,options = {}){
        sql = mysql.format(sql,options.conditions);
        
        return new Promise((resolve,reject) => {
            this.db.query(sql,(err,res) => {
                if(err){
                    reject({sqlError:err,error:"Database Query Error"});
                }
                resolve(res);
            });
        });
    }

    userLookUp(bnid){
        let sql = mysql.format("select * from users where empybnid = ?",[bnid]);

        return new Promise((resolve,reject) => {
            this.db.query(sql,(err,res) => {
                if(err){
                    reject({sqlError:err,error:"Database Query Error"});
                }
                resolve(res);
            })
        })
    }

    build(){
        this.db = mysql.createConnection(config.db_config());

        this.db.connect((err) => {
            if(err)
                throw err;
        });
    }
}

let dbhandler = new DbHandler();

module.exports = dbhandler
