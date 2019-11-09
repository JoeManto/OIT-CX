while ! mysql -h db -u root -proot -P 3306 -e "SELECT VERSION();SELECT NOW()"; do
    sleep 5;
    echo "mysql is not connected";

done;
echo "starting node"
#exec mysql -h db -u root -proot -P 3306 -e "CREATE DATABASE nodemysql"
#exec mysql -h db -u root -proot -P 3306 nodemysql < Server/sqldump.sql
exec node Server/server.js
