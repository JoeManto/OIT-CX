let mysql = require('mysql');
const config = require('./SecertConfig.js');

//DataBase Connection Config
const db = mysql.createConnection(config.db_config());

/* [Spike Test 1]
*   Testing that the mysql module is able to connect
*/
//Test DataBase Connection
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('mysql connected...');
});


/* [Spike Test 2]
*  Testing a simple select statment
*/
db.query('select * from users', (err,res) => {
    if(err) throw 'SQL SELECT ERROR';

    //first record
    console.log(res[0]);
});

/* [Spike Test 3]
*    Testing a simple insert statment
*/
db.query('insert into users (id,name,surname) values (1,joe,manto)', (err,res) => {
    if(err) throw 'SQL INSERT ERROR';

    console.log(res);
});

/* [Spike Test 4]
*   Testing a simple remove statment
*/
db.query('Delete from users where id = 1', (err,res) => {
    if (err) throw 'SQL DELETE ERROR';

    console.log(res);
});