mysqlRootPass=12345678;
host=localhost;

while ! mysql -h $host -u root -p$mysqlRootPass -P 3306 -e "SELECT VERSION();SELECT NOW()"; do
    sleep 5;
    echo "mysql is not connected";

done;

#mysql -h $host -u root -p$mysqlRootPass -P 3306 -e 'DROP DATABASE nodemysql';

databases="$(mysql -h $host -u root -p$mysqlRootPass -P 3306 -e 'show databases')";

if [[ "$databases" != *"nodemysql"* ]]; then
  echo "database wasn't found starting init of fresh db";

  mysql -h $host -u root -p$mysqlRootPass -P 3306 -e 'CREATE DATABASE nodemysql';
  mysql -h $host -u root -p$mysqlRootPass -P 3306 nodemysql < db_init.sql
  mysql -h $host -u root -p$mysqlRootPass -P 3306 -e "USE nodemysql;create table env (id int PRIMARY KEY AUTO_INCREMENT,varType varchar(255), varName varchar(255), varValue varchar(255));"

fi

#override process enviorment vars
overrides="$(mysql -h $host -u root -p$mysqlRootPass -P 3306 -e 'USE nodemysql;select * from env')";

gcc env_override_parser.c;

parsed_overrides="$(./a.out $overrides)";

split=( $( echo $parsed_overrides | cut -d' ' -f1- ) );

for ((i = 0; i < ${#split[@]}; i++)); do 
    echo 'exporting';
    export ${split[$i]};
done


#Node entry
echo "starting node";
#exec node Server/server.js
