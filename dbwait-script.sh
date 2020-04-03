while ! mysql -h db -u root -proot -P 3306 -e "SELECT VERSION();SELECT NOW()"; do
    sleep 5;
    echo "mysql is not connected";

done;


mysql -h db -u root -proot -P 3306 -e "USE nodemysql;create table env (id int PRIMARY KEY AUTO_INCREMENT,varType varchar(255), varName varchar(255), varValue varchar(255)); insert into env (varType,varName,varValue) values ('string','LDAP_PASS','testpassword')";

#override process enviorment vars
overrides="$(mysql -h db -u root -proot -P 3306 -e 'USE nodemysql;select * from env')";

gcc env_override_parser.c;

parsed_overrides="$(./a.out $overrides)";

split=( $( echo $parsed_overrides | cut -d' ' -f1- ) );

for ((i = 0; i < ${#split[@]}; i++)); do 
    export ${split[$i]};
done

#exec mysql -h db -u root -proot -P 3306 -e "CREATE DATABASE nodemysql"
#exec mysql -h db -u root -proot -P 3306 nodemysql < db_init.sql

#Node entry
echo "starting node";
exec node Server/server.js
